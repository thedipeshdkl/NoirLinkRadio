const fs = require('fs');
let code = fs.readFileSync('src/index.ts', 'utf8');

const replacements = [
  // Analytics/System/Audit (SUPER_ADMIN)
  ["app.get('/api/audit-logs', requireAuth(),", "app.get('/api/audit-logs', requireAuth(['SUPER_ADMIN']),"],
  ["app.get('/api/analytics/stats', requireAuth(),", "app.get('/api/analytics/stats', requireAuth(['SUPER_ADMIN', 'ADMIN']),"],
  ["app.get('/api/system/health', requireAuth(),", "app.get('/api/system/health', requireAuth(['SUPER_ADMIN']),"],
  
  // Programs (SUPER_ADMIN, ADMIN, EDITOR)
  ["app.post('/api/programs', requireAuth(),", "app.post('/api/programs', requireAuth(['SUPER_ADMIN', 'ADMIN', 'EDITOR']),"],
  ["app.put('/api/programs/:id', requireAuth(),", "app.put('/api/programs/:id', requireAuth(['SUPER_ADMIN', 'ADMIN', 'EDITOR']),"],
  ["app.delete('/api/programs/:id', requireAuth(),", "app.delete('/api/programs/:id', requireAuth(['SUPER_ADMIN', 'ADMIN', 'EDITOR']),"],
  
  // News (SUPER_ADMIN, ADMIN, EDITOR)
  ["app.post('/api/news', requireAuth(),", "app.post('/api/news', requireAuth(['SUPER_ADMIN', 'ADMIN', 'EDITOR']),"],
  ["app.put('/api/news/:id', requireAuth(),", "app.put('/api/news/:id', requireAuth(['SUPER_ADMIN', 'ADMIN', 'EDITOR']),"],
  ["app.delete('/api/news/:id', requireAuth(),", "app.delete('/api/news/:id', requireAuth(['SUPER_ADMIN', 'ADMIN', 'EDITOR']),"],
  
  // Breaking News (SUPER_ADMIN, ADMIN, EDITOR)
  ["app.get('/api/breaking-news', requireAuth(),", "app.get('/api/breaking-news', requireAuth(['SUPER_ADMIN', 'ADMIN', 'EDITOR']),"],
  ["app.post('/api/breaking-news', requireAuth(),", "app.post('/api/breaking-news', requireAuth(['SUPER_ADMIN', 'ADMIN', 'EDITOR']),"],
  ["app.put('/api/breaking-news/:id', requireAuth(),", "app.put('/api/breaking-news/:id', requireAuth(['SUPER_ADMIN', 'ADMIN', 'EDITOR']),"],
  ["app.delete('/api/breaking-news/:id', requireAuth(),", "app.delete('/api/breaking-news/:id', requireAuth(['SUPER_ADMIN', 'ADMIN', 'EDITOR']),"],

  // Presenters (SUPER_ADMIN, ADMIN)
  ["app.post('/api/presenters', requireAuth(),", "app.post('/api/presenters', requireAuth(['SUPER_ADMIN', 'ADMIN']),"],
  ["app.put('/api/presenters/:id', requireAuth(),", "app.put('/api/presenters/:id', requireAuth(['SUPER_ADMIN', 'ADMIN']),"],
  ["app.delete('/api/presenters/:id', requireAuth(),", "app.delete('/api/presenters/:id', requireAuth(['SUPER_ADMIN', 'ADMIN']),"],

  // Events (SUPER_ADMIN, ADMIN)
  ["app.post('/api/events', requireAuth(),", "app.post('/api/events', requireAuth(['SUPER_ADMIN', 'ADMIN']),"],
  ["app.put('/api/events/:id', requireAuth(),", "app.put('/api/events/:id', requireAuth(['SUPER_ADMIN', 'ADMIN']),"],
  ["app.delete('/api/events/:id', requireAuth(),", "app.delete('/api/events/:id', requireAuth(['SUPER_ADMIN', 'ADMIN']),"],

  // Polls (SUPER_ADMIN, ADMIN)
  ["app.post('/api/polls', requireAuth(),", "app.post('/api/polls', requireAuth(['SUPER_ADMIN', 'ADMIN']),"],
  ["app.put('/api/polls/:id', requireAuth(),", "app.put('/api/polls/:id', requireAuth(['SUPER_ADMIN', 'ADMIN']),"],
  ["app.delete('/api/polls/:id', requireAuth(),", "app.delete('/api/polls/:id', requireAuth(['SUPER_ADMIN', 'ADMIN']),"],

  // Requests (SUPER_ADMIN, ADMIN, MODERATOR)
  ["app.get('/api/requests', requireAuth(),", "app.get('/api/requests', requireAuth(['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'PRESENTER']),"],
  ["app.put('/api/requests/:id', requireAuth(),", "app.put('/api/requests/:id', requireAuth(['SUPER_ADMIN', 'ADMIN', 'MODERATOR']),"],
  ["app.delete('/api/requests/:id', requireAuth(),", "app.delete('/api/requests/:id', requireAuth(['SUPER_ADMIN', 'ADMIN', 'MODERATOR']),"],
];

for (const [from, to] of replacements) {
  code = code.replace(from, to);
}

fs.writeFileSync('src/index.ts', code);
console.log('Roles updated');
