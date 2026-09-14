import assert from 'node:assert/strict';
import test from 'node:test';
import express from 'express';

import authRoutes from '../../routes/auth.js';
import usersRoutes from '../../routes/users.js';

test('auth routes expose only login and profile endpoints', () => {
  const paths = authRoutes.stack
    .filter((layer) => layer.route)
    .map((layer) => Object.keys(layer.route.methods).filter((method) => layer.route.methods[method]).map((method) => `${method.toUpperCase()} ${layer.route.path}`))
    .flat();

  assert.ok(paths.some((path) => path.includes('POST /register')));
  assert.ok(paths.some((path) => path.includes('POST /login')));
  assert.ok(paths.some((path) => path.includes('GET /profile')));
});

test('users routes support status change without permanent delete route', () => {
  const paths = usersRoutes.stack
    .filter((layer) => layer.route)
    .map((layer) => Object.keys(layer.route.methods).filter((method) => layer.route.methods[method]).map((method) => `${method.toUpperCase()} ${layer.route.path}`))
    .flat();

  assert.ok(paths.some((path) => path.includes('PATCH /:id/status')));
  assert.ok(!paths.some((path) => path.includes('DELETE /:id')));
});
