import assert from 'node:assert/strict';
import { registerSchema, loginSchema } from '../utils/validation.js';

const validRegister = registerSchema.parse({
  email: 'admin@lexflow.com',
  password: 'senha123',
  nome: 'Administrador',
});

assert.equal(validRegister.email, 'admin@lexflow.com');
assert.equal(validRegister.perfil, 'usuario');
assert.throws(() => registerSchema.parse({
  email: 'invalido',
  password: '123',
  nome: 'A',
}), /email|password|nome/i);

const validLogin = loginSchema.parse({
  email: 'admin@lexflow.com',
  password: 'senha123',
});

assert.equal(validLogin.email, 'admin@lexflow.com');
console.log('validation tests passed');
