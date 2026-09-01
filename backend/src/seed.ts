import { db } from './db';
import * as schema from './schema';
import { eq } from 'drizzle-orm';
import * as argon2 from 'argon2';

async function seed() {
  console.log("Seeding database...");

  const adminEmail = process.env.INITIAL_ADMIN_EMAIL;
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    const passwordHash = await argon2.hash(adminPassword);
    await db.insert(schema.users).values({
      email: adminEmail,
      passwordHash,
      role: 'SUPER_ADMIN',
      createdAt: new Date(),
    }).onConflictDoNothing({ target: schema.users.email });
    console.log("Admin user seeded (or already exists).");
  } else {
    console.log("Skipping admin user seed: INITIAL_ADMIN_EMAIL or INITIAL_ADMIN_PASSWORD not set.");
  }

  // Programs
  const seededPrograms = await db.insert(schema.programs).values([
    { title: "मर्निङ ड्राइभ", slug: "morning-drive", description: "उत्कृष्ट संगीतको साथ आफ्नो दिनको सुरुवात गर्नुहोस्।", presenter: "Dipesh Dhakal", createdAt: new Date() },
    { title: "न्युज आवर", slug: "news-hour", description: "आजका प्रमुख समाचारहरूको विस्तृत विश्लेषण।", presenter: "Dipesh Dhakal", createdAt: new Date() },
    { title: "मिड-डे मिक्स", slug: "midday-mix", description: "तपाईंको कार्यदिनको लागि उत्तम सांगीतिक आनन्द।", presenter: "Dipesh Dhakal", createdAt: new Date() },
    { title: "आफ्टरनुन डिलाइट", slug: "afternoon-delight", description: "रमाइला धुनहरू र अन्तरक्रियात्मक खेलहरू।", presenter: "Dipesh Dhakal", createdAt: new Date() },
    { title: "इभिनिङ न्युज एण्ड टक", slug: "evening-news-talk", description: "दिनभरिका घटनाक्रमहरूको सँगालो।", presenter: "Dipesh Dhakal", createdAt: new Date() }
  ]).onConflictDoNothing({ target: schema.programs.slug }).returning();
  console.log("Programs seeded.");

    if (seededPrograms && seededPrograms.length === 5) { // Only seed schedule if ALL programs were freshly inserted
      // Schedule (Mon-Fri)
      const scheduleData = [
        { programId: seededPrograms[0].id, dayOfWeek: 1, startTime: "06:00", endTime: "09:00" },
        { programId: seededPrograms[1].id, dayOfWeek: 1, startTime: "09:00", endTime: "12:00" },
        { programId: seededPrograms[2].id, dayOfWeek: 1, startTime: "12:00", endTime: "15:00" },
        { programId: seededPrograms[3].id, dayOfWeek: 1, startTime: "15:00", endTime: "18:00" },
        { programId: seededPrograms[4].id, dayOfWeek: 1, startTime: "18:00", endTime: "21:00" },
        { programId: seededPrograms[0].id, dayOfWeek: 2, startTime: "06:00", endTime: "09:00" },
        { programId: seededPrograms[1].id, dayOfWeek: 2, startTime: "09:00", endTime: "12:00" },
        { programId: seededPrograms[2].id, dayOfWeek: 2, startTime: "12:00", endTime: "15:00" },
        { programId: seededPrograms[3].id, dayOfWeek: 2, startTime: "15:00", endTime: "18:00" },
        { programId: seededPrograms[4].id, dayOfWeek: 2, startTime: "18:00", endTime: "21:00" },
      ];
      // Insert schedules, but we don't have a unique constraint on schedule natively without making composite keys. 
      // Wrapping it inside the seededPrograms length check avoids duplicating.
      await db.insert(schema.schedule).values(scheduleData);
      console.log("Schedule seeded.");
    }

  // News
  await db.insert(schema.news).values([
    { title: "Global Summit Reaches Historic Agreement", slug: "global-summit-historic-agreement", content: "Full content here...", category: "World", author: "Jane Doe", imageUrl: "https://images.unsplash.com/photo-1618042164219-62c820f10723?w=800&q=80", isBreaking: true, publishedAt: new Date() },
    { title: "Tech Giants Announce Unified AI Safety Standards", slug: "tech-giants-unified-ai", content: "Full content here...", category: "Tech", author: "John Smith", imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80", isBreaking: false, publishedAt: new Date(Date.now() - 3600000) },
    { title: "Market Rallies as Inflation Shows Signs of Cooling", slug: "market-rallies-inflation", content: "Full content here...", category: "Business", author: "Alice Johnson", imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80", isBreaking: false, publishedAt: new Date(Date.now() - 7200000) },
  ]).onConflictDoNothing({ target: schema.news.slug });
  console.log("News seeded.");

  // Podcasts
  const seededPodcasts = await db.insert(schema.podcasts).values([
    { title: "The Tech Daily", slug: "tech-daily", description: "A daily dive into tech news.", host: "Dipesh Dhakal", imageUrl: "/dipesh.jpg", category: "Technology" },
    { title: "Political Insider", slug: "political-insider", description: "Deep conversations with lawmakers.", host: "Dipesh Dhakal", imageUrl: "/dipesh.jpg", category: "Politics" },
  ]).onConflictDoNothing({ target: schema.podcasts.slug }).returning();
  
  if (seededPodcasts && seededPodcasts.length === 2) {
    await db.insert(schema.podcastEpisodes).values([
      { podcastId: seededPodcasts[0].id, title: "AI Regulation: What's Next?", description: "Discussing AI laws", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", duration: 2700, publishedAt: new Date() },
      { podcastId: seededPodcasts[1].id, title: "The Midterm Strategies", description: "Election prep", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", duration: 3120, publishedAt: new Date(Date.now() - 86400000) },
    ]);
  }
  console.log("Podcasts seeded.");

  // Live Video Events
  // Note: Since live events are time sensitive, seeding them statically doesn't make much sense in production, 
  // but for completeness we ensure no duplicate crashes if run twice. 
  // We'll skip onConflictDoNothing here because we don't have a unique constraint to easily target.
  const existingLiveEvents = await db.select().from(schema.liveVideoEvents).limit(1);
  if (existingLiveEvents.length === 0) {
    await db.insert(schema.liveVideoEvents).values([
      { title: "Morning News", description: "Live broadcast of the morning news", startTime: new Date(Date.now() - 3600000), endTime: new Date(Date.now() + 3600000), isLive: true },
      { title: "Midday News", description: "Midday update", startTime: new Date(Date.now() + 7200000), endTime: new Date(Date.now() + 10800000), isLive: false },
    ]);
    console.log("Live Events seeded.");
  }

  // Site Settings (CMS defaults)
  const defaultSettings = [
    {
      key: 'general',
      value: { siteName: "NoirLink Radio", tagline: "Your Voice, Your Music", description: "The best radio station in town." },
      updatedAt: new Date()
    },
    {
      key: 'homepage',
      value: { heroTitle: "Welcome to NoirLink Radio", heroSubtitle: "Live 24/7 Music & News", ctaText: "Listen Now", ctaLink: "/radio" },
      updatedAt: new Date()
    },
    {
      key: 'contact',
      value: { email: "contact@noirlink.com", phone: "+977-1-4000000", address: "Kathmandu, Nepal", facebook: "https://facebook.com", twitter: "https://twitter.com" },
      updatedAt: new Date()
    }
  ];

  await db.insert(schema.siteSettings).values(defaultSettings).onConflictDoNothing({ target: schema.siteSettings.key });
  console.log("Site Settings CMS seeded.");

  console.log("Seeding complete!");
}

seed().catch(console.error);
