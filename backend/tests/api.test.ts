import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { serve } from '@hono/node-server';
import app from '../src/index';

describe('Public API Endpoints', () => {
  let server: any;

  beforeAll(() => {
    // We are binding Hono to a random port for testing
    server = serve({
      fetch: app.fetch,
      port: 0
    });
  });

  it('GET /api/public/settings should return settings object', async () => {
    const response = await request(server).get('/api/public/settings');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toBeDefined();
  });

  it('GET /api/system/health should be protected', async () => {
    const response = await request(server).get('/api/system/health');
    // Without auth, it should fail
    expect(response.status).toBe(401);
  });
});
