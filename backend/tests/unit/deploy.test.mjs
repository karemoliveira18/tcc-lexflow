import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import test from 'node:test';
import request from 'supertest';

process.env.NODE_ENV = 'production';
process.env.DATABASE_URL = 'mysql://validation:validation@127.0.0.1:1/validation';
process.env.JWT_SECRET = randomBytes(48).toString('hex');
process.env.FRONTEND_URL = 'https://frontend.example.test/tecti/2026/gpec02/';
process.env.PORT = '10000';
const { app } = await import('../../server.js');
const { validateEnvironment } = await import('../../config/env.js');

test('health needs no database; CORS uses origin without the SPA path', async () => {
  const res = await request(app).get('/health').set('Origin', 'https://frontend.example.test');
  assert.equal(res.status, 200);
  assert.equal(res.headers['access-control-allow-origin'], 'https://frontend.example.test');
  assert.equal((await request(app).get('/api/health')).status, 200);
  const preflight = await request(app).options('/api/clientes')
    .set('Origin', 'https://frontend.example.test')
    .set('Access-Control-Request-Method', 'POST')
    .set('Access-Control-Request-Headers', 'Authorization,Content-Type');
  assert.equal(preflight.status, 204);
  assert.equal((await request(app).get('/health').set('Origin', 'https://other.example.test')).status, 403);
});

test('production rejects missing secret, SQLite and invalid ports', () => {
  for (const [key, bad] of [['JWT_SECRET', ''], ['DATABASE_URL', 'file:./dev.db'], ['PORT', 'bad']]) {
    const original = process.env[key];
    try { process.env[key] = bad; assert.throws(() => validateEnvironment()); }
    finally { process.env[key] = original; }
  }
});
