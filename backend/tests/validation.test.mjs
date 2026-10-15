import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { registerSchema, loginSchema } from '../utils/validation.js';

const generatedPassword = () => `${randomBytes(24).toString('base64url')}Aa7!`;

const validRegister = registerSchema.parse({
  email: 'admin@example.test',
  password: generatedPassword(),
  nome: 'Administrador',
});

assert.equal(validRegister.email, 'admin@example.test');
assert.equal(validRegister.perfil, 'usuario');
assert.throws(() => registerSchema.parse({
  email: 'invalido',
  password: '123',
  nome: 'A',
}), /email|password|nome/i);

const validLogin = loginSchema.parse({
  email: 'admin@example.test',
  password: generatedPassword(),
});

assert.equal(validLogin.email, 'admin@example.test');
console.log('validation tests passed');
