import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('ADMIN'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const programs = sqliteTable('programs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  presenter: text('presenter'),
  presenterImage: text('presenter_image'),
  imageUrl: text('image_url'),
  category: text('category'),
  startTime: text('start_time'), // format HH:MM
  endTime: text('end_time'), // format HH:MM
  daysOfWeek: text('days_of_week'), // e.g. "1,2,3,4,5"
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});

export const schedule = sqliteTable('schedule', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  programId: integer('program_id').references(() => programs.id, { onDelete: 'cascade' }),
  dayOfWeek: integer('day_of_week').notNull(), // 0 = Sunday, 1 = Monday, etc.
  startTime: text('start_time').notNull(), // format HH:MM
  endTime: text('end_time').notNull(), // format HH:MM
});

export const news = sqliteTable('news', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content').notNull(),
  category: text('category').notNull(),
  author: text('author'),
  imageUrl: text('image_url'),
  isBreaking: integer('is_breaking', { mode: 'boolean' }).default(false),
  status: text('status').default('published'),
  publishedAt: integer('published_at', { mode: 'timestamp' }).notNull(),
});

export const podcasts = sqliteTable('podcasts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  host: text('host'),
  imageUrl: text('image_url'),
  category: text('category'),
});

export const podcastEpisodes = sqliteTable('podcast_episodes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  podcastId: integer('podcast_id').references(() => podcasts.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  audioUrl: text('audio_url').notNull(),
  duration: integer('duration'), // in seconds
  publishedAt: integer('published_at', { mode: 'timestamp' }).notNull(),
});

export const liveVideoEvents = sqliteTable('live_video_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description'),
  streamUrl: text('stream_url'), // Added streamUrl
  thumbnailUrl: text('thumbnail_url'),
  startTime: integer('start_time', { mode: 'timestamp' }).notNull(),
  endTime: integer('end_time', { mode: 'timestamp' }),
  isLive: integer('is_live', { mode: 'boolean' }).default(false),
});

export const auditLogs = sqliteTable('audit_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: text('action').notNull(),
  entity: text('entity').notNull(),
  entityId: integer('entity_id'),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
});

export const newsletterSubscribers = sqliteTable('newsletter_subscribers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  subscribedAt: integer('subscribed_at', { mode: 'timestamp' }).notNull(),
});

export const contactMessages = sqliteTable('contact_messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject'),
  message: text('message').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const presenters = sqliteTable('presenters', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  bio: text('bio'),
  profileImageUrl: text('profile_image_url'),
  socialLinks: text('social_links', { mode: 'json' }), // JSON string of links
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const listenerSessions = sqliteTable('listener_sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sessionId: text('session_id').notNull(),
  startTime: integer('start_time', { mode: 'timestamp' }).notNull(),
  endTime: integer('end_time', { mode: 'timestamp' }),
  duration: integer('duration'), // in seconds
  programId: integer('program_id').references(() => programs.id, { onDelete: 'set null' }),
  contentType: text('content_type').default('live_radio'), // live_radio, podcast
  deviceType: text('device_type'),
  browser: text('browser'),
  location: text('location'), // privacy safe
});

export const analyticsEvents = sqliteTable('analytics_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  eventType: text('event_type').notNull(), // page_view, play, pause
  entityType: text('entity_type'), // news, podcast, program
  entityId: integer('entity_id'),
  sessionId: text('session_id'),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
});

export const songRequests = sqliteTable('song_requests', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  listenerName: text('listener_name').notNull(),
  songTitle: text('song_title').notNull(),
  artist: text('artist').notNull(),
  message: text('message'),
  dedication: text('dedication'),
  contactInfo: text('contact_info'),
  status: text('status').default('Pending'), // Pending, Approved, Played, Rejected
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  playedAt: integer('played_at', { mode: 'timestamp' }),
});

export const chatMessages = sqliteTable('chat_messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nickname: text('nickname').notNull(),
  message: text('message').notNull(),
  sessionId: text('session_id'),
  status: text('status').default('approved'), // approved, hidden, deleted
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const chatModeration = sqliteTable('chat_moderation', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  word: text('word').notNull().unique(), // Blocked words
});

export const favorites = sqliteTable('favorites', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  entityType: text('entity_type').notNull(), // program, podcast, news
  entityId: integer('entity_id').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const listeningHistory = sqliteTable('listening_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  entityType: text('entity_type').notNull(), // program, podcast
  entityId: integer('entity_id').notNull(),
  lastListenedAt: integer('last_listened_at', { mode: 'timestamp' }).notNull(),
});

export const playbackProgress = sqliteTable('playback_progress', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  episodeId: integer('episode_id').references(() => podcastEpisodes.id, { onDelete: 'cascade' }),
  position: integer('position').notNull(), // in seconds
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const breakingNews = sqliteTable('breaking_news', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  headline: text('headline').notNull(),
  message: text('message'),
  priority: text('priority').default('high'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const pushSubscriptions = sqliteTable('push_subscriptions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  endpoint: text('endpoint').notNull().unique(),
  p256dh: text('p256dh').notNull(),
  auth: text('auth').notNull(),
  topics: text('topics', { mode: 'json' }), // array of topics e.g. ["breaking", "podcasts"]
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const polls = sqliteTable('polls', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  question: text('question').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
  endDate: integer('end_date', { mode: 'timestamp' }),
});

export const pollOptions = sqliteTable('poll_options', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  pollId: integer('poll_id').references(() => polls.id, { onDelete: 'cascade' }),
  optionText: text('option_text').notNull(),
});

export const pollVotes = sqliteTable('poll_votes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  pollId: integer('poll_id').references(() => polls.id, { onDelete: 'cascade' }),
  optionId: integer('option_id').references(() => pollOptions.id, { onDelete: 'cascade' }),
  sessionId: text('session_id').notNull(), // To prevent multiple votes
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const events = sqliteTable('events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  imageUrl: text('image_url'),
  location: text('location'),
  livestreamUrl: text('livestream_url'),
  startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
  endDate: integer('end_date', { mode: 'timestamp' }),
  status: text('status').default('upcoming'), // upcoming, live, past
});

export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull(), // request, contact, system, moderation
  isRead: integer('is_read', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const mediaAssets = sqliteTable('media_assets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  filename: text('filename').notNull(),
  url: text('url').notNull(),
  mimeType: text('mime_type'),
  size: integer('size'),
  uploadedBy: integer('uploaded_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const securityEvents = sqliteTable('security_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  eventType: text('event_type').notNull(), // failed_login, rate_limit, blocked_request
  ipAddress: text('ip_address'),
  details: text('details', { mode: 'json' }),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
});

export const backups = sqliteTable('backups', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  filename: text('filename').notNull(),
  size: integer('size'),
  status: text('status').default('completed'), // pending, completed, failed
  createdBy: integer('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const siteSettings = sqliteTable('site_settings', {
  key: text('key').primaryKey(),
  value: text('value', { mode: 'json' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  updatedBy: integer('updated_by').references(() => users.id, { onDelete: 'set null' }),
});
