import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static';
import { cors } from 'hono/cors';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { streamSSE } from 'hono/streaming';
import { db } from './db';
import * as schema from './schema';
import { desc, eq, like, or, and } from 'drizzle-orm';
import * as argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import * as dotenv from 'dotenv';
import { secureHeaders } from 'hono/secure-headers';
import { Server as SocketIOServer } from 'socket.io';

dotenv.config();

// Simple in-memory rate limiter
const rateLimitCache = new Map<string, { count: number, resetTime: number }>();
const rateLimitMiddleware = (limit = 100, windowMs = 60000) => {
  return async (c: any, next: any) => {
    const ip = c.req.header('x-forwarded-for') || '127.0.0.1';
    const now = Date.now();
    const record = rateLimitCache.get(ip);
    
    if (record && record.resetTime > now) {
      if (record.count >= limit) {
        return c.json({ success: false, error: 'Too many requests' }, 429);
      }
      record.count += 1;
    } else {
      rateLimitCache.set(ip, { count: 1, resetTime: now + windowMs });
    }
    
    await next();
  };
};

const app = new Hono<{ Variables: { user: any } }>();

app.use('*', secureHeaders());
app.use('/api/*', rateLimitMiddleware(200, 60000));

app.use('/*', cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.onError((err, c) => {
  console.error('API Error:', err);
  return c.json({ success: false, error: 'Internal Server Error' }, 500);
});

const JWT_SECRET = process.env.SESSION_SECRET || 'super_secret_session_key_change_me_in_production';

// Middleware for Authentication
const requireAuth = (allowedRoles?: string[]) => async (c: any, next: any) => {
  const token = getCookie(c, 'auth_token');
  if (!token) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123') as { userId: number, role: string };
    
    if (allowedRoles && !allowedRoles.includes(decoded.role)) {
      return c.json({ success: false, error: 'Forbidden - Insufficient permissions' }, 403);
    }
    
    c.set('user', decoded);
    await next();
  } catch (error) {
    return c.json({ success: false, error: 'Invalid token' }, 401);
  }
};

app.get('/', (c) => {
  return c.text('Radio Station API');
});

// --- Auth ---
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

app.post('/api/auth/login', rateLimitMiddleware(5, 60000), async (c) => {
  try {
    const body = await c.req.json();
    const data = loginSchema.parse(body);

    const user = await db.select().from(schema.users).where(eq(schema.users.email, data.email)).limit(1);
    if (user.length === 0) {
      return c.json({ success: false, error: 'Invalid credentials' }, 401);
    }

    const validPassword = await argon2.verify(user[0].passwordHash, data.password);
    if (!validPassword) {
      return c.json({ success: false, error: 'Invalid credentials' }, 401);
    }

    const token = jwt.sign({ userId: user[0].id, role: user[0].role }, JWT_SECRET, { expiresIn: '1d' });
    
    setCookie(c, 'auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    // Log the action
    await db.insert(schema.auditLogs).values({
      userId: user[0].id,
      action: 'LOGIN',
      entity: 'USER',
      entityId: user[0].id,
      timestamp: new Date()
    });

    return c.json({ success: true, user: { id: user[0].id, email: user[0].email, role: user[0].role } });
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 400);
  }
});

app.post('/api/auth/logout', (c) => {
  deleteCookie(c, 'auth_token', { path: '/' });
  return c.json({ success: true });
});

app.get('/api/auth/me', requireAuth(), async (c) => {
  const user = c.get('user') as any;
  return c.json({ success: true, user });
});

// --- Programs ---
app.get('/api/programs', async (c) => {
  const allPrograms = await db.select().from(schema.programs);
  return c.json({ success: true, data: allPrograms });
});

app.post('/api/programs', requireAuth(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (c) => {
  try {
    const body = await c.req.json();
    body.createdAt = new Date();
    const newProgram = await db.insert(schema.programs).values(body).returning();
    return c.json({ success: true, data: newProgram[0] });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 400);
  }
});

app.put('/api/programs/:id', requireAuth(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();
    body.updatedAt = new Date();
    const updated = await db.update(schema.programs).set(body).where(eq(schema.programs.id, id)).returning();
    return c.json({ success: true, data: updated[0] });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 400);
  }
});

app.delete('/api/programs/:id', requireAuth(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (c) => {
  const id = parseInt(c.req.param('id'));
  await db.delete(schema.programs).where(eq(schema.programs.id, id));
  return c.json({ success: true });
});

// --- Presenters ---
app.get('/api/presenters', async (c) => {
  const allPresenters = await db.select().from(schema.presenters);
  return c.json({ success: true, data: allPresenters });
});

app.get('/api/presenters/:slug', async (c) => {
  const slug = c.req.param('slug');
  const presenter = await db.select().from(schema.presenters).where(eq(schema.presenters.slug, slug)).limit(1);
  if (presenter.length === 0) return c.json({ success: false, error: 'Not found' }, 404);
  return c.json({ success: true, data: presenter[0] });
});

app.post('/api/presenters', requireAuth(['SUPER_ADMIN', 'ADMIN']), async (c) => {
  try {
    const body = await c.req.json();
    body.createdAt = new Date();
    if (!body.slug) body.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newPresenter = await db.insert(schema.presenters).values(body).returning();
    return c.json({ success: true, data: newPresenter[0] });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 400);
  }
});

app.put('/api/presenters/:id', requireAuth(['SUPER_ADMIN', 'ADMIN']), async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();
    const updated = await db.update(schema.presenters).set(body).where(eq(schema.presenters.id, id)).returning();
    return c.json({ success: true, data: updated[0] });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 400);
  }
});

app.delete('/api/presenters/:id', requireAuth(['SUPER_ADMIN', 'ADMIN']), async (c) => {
  const id = parseInt(c.req.param('id'));
  await db.delete(schema.presenters).where(eq(schema.presenters.id, id));
  return c.json({ success: true });
});

// --- Schedule ---
app.get('/api/schedule', async (c) => {
  const currentSchedule = await db.select().from(schema.schedule);
  return c.json({ success: true, data: currentSchedule });
});

// --- News ---
app.get('/api/news', async (c) => {
  const latestNews = await db.select().from(schema.news).orderBy(desc(schema.news.publishedAt));
  return c.json({ success: true, data: latestNews });
});

app.post('/api/news', requireAuth(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (c) => {
  try {
    const body = await c.req.json();
    body.publishedAt = body.publishedAt ? new Date(body.publishedAt) : new Date();
    if (!body.slug) body.slug = body.title.toLowerCase().replace(/\s+/g, '-');
    const newNews = await db.insert(schema.news).values(body).returning();
    return c.json({ success: true, data: newNews[0] });
  } catch(err: any) {
    return c.json({ success: false, error: err.message }, 400);
  }
});

app.put('/api/news/:id', requireAuth(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();
    if (body.publishedAt) body.publishedAt = new Date(body.publishedAt);
    const updated = await db.update(schema.news).set(body).where(eq(schema.news.id, id)).returning();
    return c.json({ success: true, data: updated[0] });
  } catch(err: any) {
    return c.json({ success: false, error: err.message }, 400);
  }
});

app.delete('/api/news/:id', requireAuth(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (c) => {
  const id = parseInt(c.req.param('id'));
  await db.delete(schema.news).where(eq(schema.news.id, id));
  return c.json({ success: true });
});

// --- Podcasts ---
app.get('/api/podcasts', async (c) => {
  const allPodcasts = await db.select().from(schema.podcasts);
  return c.json({ success: true, data: allPodcasts });
});

// --- Live Video Events ---
app.get('/api/live-video', async (c) => {
  const events = await db.select().from(schema.liveVideoEvents).orderBy(desc(schema.liveVideoEvents.startTime));
  return c.json({ success: true, data: events });
});

// --- Newsletter & Contact ---
app.post('/api/newsletter', async (c) => {
  try {
    const body = await c.req.json();
    await db.insert(schema.newsletterSubscribers).values({ email: body.email, subscribedAt: new Date() });
    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 400);
  }
});

app.post('/api/contact', rateLimitMiddleware(5, 60000), async (c) => {
  try {
    const body = await c.req.json();
    await db.insert(schema.contactMessages).values({ ...body, createdAt: new Date() });
    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 400);
  }
});

// --- Song Requests ---
app.get('/api/requests', requireAuth(['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'PRESENTER']), async (c) => {
  const allRequests = await db.select().from(schema.songRequests).orderBy(desc(schema.songRequests.createdAt));
  return c.json({ success: true, data: allRequests });
});

app.post('/api/requests', rateLimitMiddleware(3, 60000), async (c) => {
  try {
    const body = await c.req.json();
    body.createdAt = new Date();
    body.status = 'Pending';
    const newRequest = await db.insert(schema.songRequests).values(body).returning();
    
    // Create an admin notification
    await db.insert(schema.notifications).values({
      title: 'New Song Request',
      message: `${body.listenerName} requested ${body.songTitle} by ${body.artist}`,
      type: 'request',
      createdAt: new Date()
    });
    
    return c.json({ success: true, data: newRequest[0] });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 400);
  }
});

app.put('/api/requests/:id', requireAuth(['SUPER_ADMIN', 'ADMIN', 'MODERATOR']), async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();
    if (body.status === 'Played' && !body.playedAt) {
      body.playedAt = new Date();
    }
    const updated = await db.update(schema.songRequests).set(body).where(eq(schema.songRequests.id, id)).returning();
    return c.json({ success: true, data: updated[0] });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 400);
  }
});

app.delete('/api/requests/:id', requireAuth(['SUPER_ADMIN', 'ADMIN', 'MODERATOR']), async (c) => {
  const id = parseInt(c.req.param('id'));
  await db.delete(schema.songRequests).where(eq(schema.songRequests.id, id));
  return c.json({ success: true });
});

// --- Audit Logs ---
app.get('/api/audit-logs', requireAuth(['SUPER_ADMIN']), async (c) => {
  const logs = await db.select().from(schema.auditLogs).orderBy(desc(schema.auditLogs.timestamp)).limit(100);
  return c.json({ success: true, data: logs });
});

// --- Global Search ---
app.get('/api/search', async (c) => {
  const query = c.req.query('q');
  if (!query || query.length < 2) return c.json({ success: true, data: [] });

  const searchStr = `%${query}%`;

  const [newsRes, programsRes, presentersRes, podcastsRes] = await Promise.all([
    db.select().from(schema.news).where(or(like(schema.news.title, searchStr), like(schema.news.content, searchStr))).limit(5),
    db.select().from(schema.programs).where(or(like(schema.programs.title, searchStr), like(schema.programs.description, searchStr))).limit(5),
    db.select().from(schema.presenters).where(or(like(schema.presenters.name, searchStr), like(schema.presenters.bio, searchStr))).limit(5),
    db.select().from(schema.podcasts).where(or(like(schema.podcasts.title, searchStr), like(schema.podcasts.description, searchStr))).limit(5)
  ]);

  const results = [
    ...newsRes.map(n => ({ type: 'news', id: n.id, title: n.title, description: n.content?.substring(0,100), url: `/news/${n.slug}` })),
    ...programsRes.map(p => ({ type: 'program', id: p.id, title: p.title, description: p.description?.substring(0,100), url: `/programs/${p.id}` })),
    ...presentersRes.map(p => ({ type: 'presenter', id: p.id, title: p.name, description: p.bio?.substring(0,100), url: `/presenters/${p.slug}` })),
    ...podcastsRes.map(p => ({ type: 'podcast', id: p.id, title: p.title, description: p.description?.substring(0,100), url: `/podcasts` }))
  ];

  return c.json({ success: true, data: results });
});

// --- Breaking News ---
app.get('/api/breaking-news', requireAuth(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (c) => {
  const allNews = await db.select().from(schema.breakingNews).orderBy(desc(schema.breakingNews.createdAt));
  return c.json({ success: true, data: allNews });
});

app.get('/api/breaking-news/active', async (c) => {
  const activeNews = await db.select().from(schema.breakingNews).where(eq(schema.breakingNews.isActive, true)).orderBy(desc(schema.breakingNews.createdAt)).limit(1);
  return c.json({ success: true, data: activeNews[0] || null });
});

app.post('/api/breaking-news', requireAuth(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (c) => {
  try {
    const body = await c.req.json();
    body.createdAt = new Date();
    // If activating this one, deactivate others
    if (body.isActive) {
      await db.update(schema.breakingNews).set({ isActive: false });
    }
    const newNews = await db.insert(schema.breakingNews).values(body).returning();
    return c.json({ success: true, data: newNews[0] });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 400);
  }
});

app.put('/api/breaking-news/:id', requireAuth(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();
    if (body.isActive) {
      await db.update(schema.breakingNews).set({ isActive: false });
    }
    const updated = await db.update(schema.breakingNews).set(body).where(eq(schema.breakingNews.id, id)).returning();
    return c.json({ success: true, data: updated[0] });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 400);
  }
});

app.delete('/api/breaking-news/:id', requireAuth(['SUPER_ADMIN', 'ADMIN', 'EDITOR']), async (c) => {
  const id = parseInt(c.req.param('id'));
  await db.delete(schema.breakingNews).where(eq(schema.breakingNews.id, id));
  return c.json({ success: true });
});

// SSE endpoint for breaking news
app.get('/api/stream/breaking-news', async (c) => {
  return streamSSE(c, async (stream) => {
    let lastActiveId = -1;
    while (true) {
      const activeNews = await db.select().from(schema.breakingNews).where(eq(schema.breakingNews.isActive, true)).orderBy(desc(schema.breakingNews.createdAt)).limit(1);
      const currentActiveId = activeNews[0]?.id || 0;
      
      if (currentActiveId !== lastActiveId) {
        await stream.writeSSE({
          data: JSON.stringify(activeNews[0] || null),
          event: 'breaking-news',
          id: String(new Date().getTime())
        });
        lastActiveId = currentActiveId;
      }
      await stream.sleep(10000); // Check every 10 seconds
    }
  });
});

// --- Analytics & Sessions ---
app.post('/api/analytics', async (c) => {
  try {
    const body = await c.req.json();
    body.timestamp = new Date();
    await db.insert(schema.analyticsEvents).values(body);
    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 400);
  }
});

app.get('/api/analytics/stats', requireAuth(['SUPER_ADMIN', 'ADMIN']), async (c) => {
  // Simple summary stats
  const sessions = await db.select().from(schema.listenerSessions);
  const events = await db.select().from(schema.analyticsEvents);
  
  const activeNow = sessions.filter(s => new Date(s.endTime || s.startTime || 0).getTime() > Date.now() - 2 * 60000).length;
  
  return c.json({
    success: true,
    data: {
      totalSessions: sessions.length,
      activeNow,
      totalEvents: events.length
    }
  });
});

app.post('/api/sessions/heartbeat', async (c) => {
  try {
    const body = await c.req.json();
    let sessionId = body.sessionId;
    const now = new Date();

    if (!sessionId) {
      // Create new session
      const newSession = await db.insert(schema.listenerSessions).values({
        sessionId: body.sessionId || Math.random().toString(36).substring(7),
        startTime: now,
        endTime: now,
        deviceType: body.deviceType || 'unknown',
        browser: c.req.header('user-agent') || 'unknown',
      }).returning();
      sessionId = newSession[0].id;
    } else {
      // Update existing session
      await db.update(schema.listenerSessions).set({ endTime: now }).where(eq(schema.listenerSessions.id, sessionId));
    }

    return c.json({ success: true, sessionId });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 400);
  }
});

// --- Favorites, History & Progress ---
app.get('/api/favorites', requireAuth(), async (c) => {
  const user = c.get('user') as any;
  const favs = await db.select().from(schema.favorites).where(eq(schema.favorites.userId, user.id));
  return c.json({ success: true, data: favs });
});

app.post('/api/favorites', requireAuth(), async (c) => {
  const user = c.get('user') as any;
  const body = await c.req.json();
  const existing = await db.select().from(schema.favorites).where(and(
    eq(schema.favorites.entityType, body.entityType),
    eq(schema.favorites.entityId, body.entityId)
  )).limit(1);

  if (existing.length > 0 && existing[0].userId === user.id) {
    await db.delete(schema.favorites).where(eq(schema.favorites.id, existing[0].id));
    return c.json({ success: true, action: 'removed' });
  } else {
    await db.insert(schema.favorites).values({ ...body, userId: user.id });
    return c.json({ success: true, action: 'added' });
  }
});

app.get('/api/history', requireAuth(), async (c) => {
  const user = c.get('user') as any;
  const history = await db.select().from(schema.listeningHistory).where(eq(schema.listeningHistory.userId, user.id)).orderBy(desc(schema.listeningHistory.lastListenedAt)).limit(50);
  return c.json({ success: true, data: history });
});

app.post('/api/playback-progress', requireAuth(), async (c) => {
  const user = c.get('user') as any;
  const body = await c.req.json();
  
  // Upsert progress
  const existing = await db.select().from(schema.playbackProgress).where(or(
    eq(schema.playbackProgress.episodeId, body.episodeId)
  )).limit(1);

  if (existing.length > 0 && existing[0].userId === user.id) {
    await db.update(schema.playbackProgress).set({ position: body.progressSeconds, updatedAt: new Date() }).where(eq(schema.playbackProgress.id, existing[0].id));
  } else {
    await db.insert(schema.playbackProgress).values({ ...body, userId: user.id });
  }

  // Also add to history if not just playing a few seconds
  if (body.progressSeconds > 60) {
    await db.insert(schema.listeningHistory).values({
      userId: user.id,
      entityType: 'podcast',
      entityId: body.episodeId,
      lastListenedAt: new Date()
    });
  }

  return c.json({ success: true });
});

// --- Polls ---
app.get('/api/polls', async (c) => {
  const pollsList = await db.select().from(schema.polls).orderBy(desc(schema.polls.startDate));
  
  // Fetch options for active polls
  const results = [];
  for (const p of pollsList) {
    const options = await db.select().from(schema.pollOptions).where(eq(schema.pollOptions.pollId, p.id));
    results.push({ ...p, options });
  }
  
  return c.json({ success: true, data: results });
});

app.post('/api/polls', requireAuth(['SUPER_ADMIN', 'ADMIN']), async (c) => {
  try {
    const body = await c.req.json();
    const { options, ...pollData } = body;
    pollData.createdAt = new Date();
    
    // Deactivate other polls if this one is active
    if (pollData.isActive) {
      await db.update(schema.polls).set({ isActive: false });
    }
    
    const newPoll = await db.insert(schema.polls).values(pollData).returning();
    
    if (options && options.length > 0) {
      const optionsData = options.map((opt: string) => ({ pollId: newPoll[0].id, optionText: opt }));
      await db.insert(schema.pollOptions).values(optionsData);
    }
    
    return c.json({ success: true, data: newPoll[0] });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 400);
  }
});

app.post('/api/polls/:id/vote', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();
    
    const poll = await db.select().from(schema.polls).where(eq(schema.polls.id, id));
    if (!poll.length || !poll[0].isActive) {
      return c.json({ success: false, error: "Poll is not active" }, 400);
    }
    
    await db.insert(schema.pollVotes).values({
      pollId: id,
      optionId: body.optionId,
      sessionId: body.sessionId || Math.random().toString(36).substring(7),
      createdAt: new Date()
    });
    
    // Increment option vote count
    const option = await db.select().from(schema.pollOptions).where(eq(schema.pollOptions.id, body.optionId));
    // The option doesn't have a 'votes' column in schema!
    // Votes are counted dynamically via pollVotes table.
    
    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 400);
  }
});

app.put('/api/polls/:id', requireAuth(['SUPER_ADMIN', 'ADMIN']), async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();
    if (body.isActive) {
      await db.update(schema.polls).set({ isActive: false });
    }
    await db.update(schema.polls).set(body).where(eq(schema.polls.id, id));
    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 400);
  }
});

app.delete('/api/polls/:id', requireAuth(['SUPER_ADMIN', 'ADMIN']), async (c) => {
  const id = parseInt(c.req.param('id'));
  await db.delete(schema.polls).where(eq(schema.polls.id, id));
  return c.json({ success: true });
});

// --- Events ---
app.get('/api/events', async (c) => {
  const events = await db.select().from(schema.events).orderBy(desc(schema.events.startDate));
  return c.json({ success: true, data: events });
});

app.post('/api/events', requireAuth(['SUPER_ADMIN', 'ADMIN']), async (c) => {
  try {
    const body = await c.req.json();
    const newEvent = await db.insert(schema.events).values({
      ...body,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined
    }).returning();
    return c.json({ success: true, data: newEvent[0] });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 400);
  }
});

app.put('/api/events/:id', requireAuth(['SUPER_ADMIN', 'ADMIN']), async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();
    await db.update(schema.events).set({
      ...body,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined
    }).where(eq(schema.events.id, id));
    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 400);
  }
});

app.delete('/api/events/:id', requireAuth(['SUPER_ADMIN', 'ADMIN']), async (c) => {
  const id = parseInt(c.req.param('id'));
  await db.delete(schema.events).where(eq(schema.events.id, id));
  return c.json({ success: true });
});

// --- AI Features ---
app.post('/api/ai/chat', rateLimitMiddleware(10, 60000), async (c) => {
  try {
    const { message } = await c.req.json();
    
    // In a real app, this would connect to an LLM provider (OpenAI, Gemini, etc.)
    // For this prototype, we'll provide a simulated intelligent response.
    
    let response = "I'm the NoirLink assistant. How can I help you discover great content on our station?";
    const m = message.toLowerCase();
    
    if (m.includes('schedule') || m.includes('playing')) {
      response = "Our schedule features 'Morning Drive' at 7AM, 'Midday Mix' at 11AM, and 'Evening Jazz' at 7PM. Check the Schedule tab for more details!";
    } else if (m.includes('request') || m.includes('song')) {
      response = "You can request a song by navigating to the 'Request Song' tab in the navigation bar. Tell us what you want to hear!";
    } else if (m.includes('news')) {
      response = "We cover local, tech, and entertainment news. Check our News section, or watch for the breaking news banner at the top of the screen!";
    } else if (m.includes('hello') || m.includes('hi')) {
      response = "Hello there! Welcome to NoirLink Radio. Are you looking for a specific program, podcast, or news article?";
    }

    return c.json({ success: true, data: { response } });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 400);
  }
});

// --- Site Settings (CMS) ---
const safeUrlSchema = z.string().refine((url) => {
  if (!url) return true;
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/');
}, { message: "Invalid URL protocol (must use http, https, or relative)" }).or(z.literal(''));

const settingsSchemas = {
  general: z.object({
    siteName: z.string().max(100),
    tagline: z.string().max(200).optional(),
    description: z.string().max(1000).optional()
  }),
  homepage: z.object({
    heroTitle: z.string().max(200),
    heroSubtitle: z.string().max(500).optional(),
    ctaText: z.string().max(50).optional(),
    ctaLink: safeUrlSchema.optional()
  }),
  contact: z.object({
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().max(50).optional(),
    address: z.string().max(200).optional(),
    facebook: safeUrlSchema.optional(),
    twitter: safeUrlSchema.optional(),
    instagram: safeUrlSchema.optional(),
    youtube: safeUrlSchema.optional()
  })
};

app.get('/api/public/settings', async (c) => {
  try {
    const settings = await db.select().from(schema.siteSettings);
    const result = settings.reduce((acc, curr) => {
      acc[curr.key] = typeof curr.value === 'string' ? JSON.parse(curr.value) : curr.value;
      return acc;
    }, {} as any);
    return c.json({ success: true, data: result });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.get('/api/admin/settings', requireAuth(['SUPER_ADMIN', 'ADMIN']), async (c) => {
  try {
    const settings = await db.select().from(schema.siteSettings);
    const result = settings.reduce((acc, curr) => {
      acc[curr.key] = typeof curr.value === 'string' ? JSON.parse(curr.value) : curr.value;
      return acc;
    }, {} as any);
    return c.json({ success: true, data: result });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.put('/api/admin/settings/:key', requireAuth(['SUPER_ADMIN', 'ADMIN']), async (c) => {
  try {
    const key = c.req.param('key');
    const body = await c.req.json();
    
    if (key in settingsSchemas) {
      const parsed = settingsSchemas[key as keyof typeof settingsSchemas].safeParse(body);
      if (!parsed.success) {
        return c.json({ success: false, error: (parsed as any).error.errors[0].message }, 400);
      }
    }
    
    const user = c.get('user');
    
    await db.insert(schema.siteSettings).values({
      key,
      value: body,
      updatedAt: new Date(),
      updatedBy: user.id
    }).onConflictDoUpdate({
      target: schema.siteSettings.key,
      set: {
        value: body,
        updatedAt: new Date(),
        updatedBy: user.id
      }
    });
    
    await db.insert(schema.auditLogs).values({
      userId: user.id,
      action: `UPDATE_SETTING_${key.toUpperCase()}`,
      entity: 'site_settings',
      entityId: 0,
      timestamp: new Date()
    });

    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// --- System Health ---
app.get('/api/system/health', requireAuth(['SUPER_ADMIN']), async (c) => {
  try {
    const memory = process.memoryUsage();
    const uptime = process.uptime();
    
    return c.json({
      success: true,
      data: {
        status: 'healthy',
        uptime,
        memory: {
          rss: Math.round(memory.rss / 1024 / 1024) + ' MB',
          heapTotal: Math.round(memory.heapTotal / 1024 / 1024) + ' MB',
          heapUsed: Math.round(memory.heapUsed / 1024 / 1024) + ' MB',
        },
        database: 'connected'
      }
    });
  } catch (err: any) {
    return c.json({ success: false, status: 'unhealthy', error: err.message }, 500);
  }
});

if (process.env.NODE_ENV !== 'test') {
  const port = parseInt(process.env.PORT || '3000');
  console.log(`Server is running on port ${port}`);

  const httpServer = serve({
    fetch: app.fetch,
    port
  });

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`Client connected to chat: ${socket.id}`);

    socket.on('join_chat', async () => {
      try {
        const history = await db.select()
          .from(schema.chatMessages)
          .where(eq(schema.chatMessages.status, 'approved'))
          .orderBy(desc(schema.chatMessages.createdAt))
          .limit(50);
        
        socket.emit('chat_history', history.reverse());
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    });

    socket.on('send_message', async (data) => {
      try {
        if (!data.message || data.message.trim().length === 0) return;
        
        const newMsg = await db.insert(schema.chatMessages).values({
          nickname: data.nickname || 'Anonymous',
          message: data.message.substring(0, 500),
          sessionId: socket.id,
          status: 'approved',
          createdAt: new Date()
        }).returning();

        io.emit('new_message', newMsg[0]);
      } catch (error) {
        console.error('Error saving chat message:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected from chat: ${socket.id}`);
    });
  });
}

export default app;
