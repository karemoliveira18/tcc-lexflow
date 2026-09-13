import assert from 'node:assert/strict';
import test from 'node:test';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.CORS_ALLOWED_ORIGINS = 'http://localhost:5173';
process.env.DATABASE_URL = 'mysql://root:root@localhost:3306/lexflow_test';

const { app } = await import('../../server.js');

test('health endpoint works without auth', async () => {
  const res = await request(app).get('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'OK');
});

test('register works without auth and creates user profile usuario', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      email: 'test@lexflow.com',
      password: 'senha123',
      nome: 'Usuario Teste',
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.user.perfil, 'usuario');
  assert.ok(res.body.token);
});

test('protected routes require auth', async () => {
  const res = await request(app).get('/api/users');
  assert.equal(res.status, 401);
  assert.equal(res.body.code, 'AUTH_REQUIRED');
});

test('invalid token returns 401', async () => {
  const res = await request(app)
    .get('/api/users')
    .set('Authorization', 'Bearer token-invalido');

  assert.equal(res.status, 401);
  assert.equal(res.body.code, 'INVALID_TOKEN');
});

test('route not found returns standardized 404', async () => {
  const res = await request(app).get('/api/rota-que-nao-existe');
  assert.equal(res.status, 404);
  assert.equal(res.body.code, 'NOT_FOUND');
});

test('unauthorized cors origin is blocked', async () => {
  const res = await request(app)
    .get('/api/health')
    .set('Origin', 'https://not-allowed.example');

  assert.equal(res.status, 403);
});
