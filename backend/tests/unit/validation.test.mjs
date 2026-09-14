import assert from 'node:assert/strict';
import test from 'node:test';
import {
  registerSchema,
  loginSchema,
  updateUserSchema,
  clienteSchema,
  processoSchema,
  listUsersQuerySchema,
  listClientesQuerySchema,
  listProcessosQuerySchema,
} from '../../utils/validation.js';

test('register schema force user profile and validates invalid values', () => {
  assert.equal(registerSchema.parse({
    email: 'admin@lexflow.com',
    password: 'senha123',
    nome: 'Administrador',
  }).perfil, 'usuario');

  assert.throws(() => registerSchema.parse({
    email: 'invalido',
    password: '123',
    nome: 'A',
  }), /email|password|nome/i);
});

test('login schema accepts valid payload', () => {
  assert.equal(loginSchema.parse({
    email: 'admin@lexflow.com',
    password: 'senha123',
  }).email, 'admin@lexflow.com');
});

test('partial update schemas accept valid values', () => {
  assert.equal(updateUserSchema.parse({ nome: 'Novo Nome' }).nome, 'Novo Nome');
  assert.equal(clienteSchema.parse({
    nome: 'Maria',
    cpfCnpj: '12345678909',
    email: '',
    telefone: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    observacoes: '',
  }).email, '');
  assert.equal(processoSchema.parse({
    titulo: 'Processo teste',
    area: 'Civil',
    prazo: '2026-10-10',
    clienteId: 'client-123',
  }).status, 'ativo');
});

test('pagination and filter query schemas enforce defaults and limits', () => {
  assert.deepEqual(listUsersQuerySchema.parse({}), {
    page: 1,
    limit: 20,
  });

  const invalidUsers = listUsersQuerySchema.safeParse({ limit: 101 });
  assert.equal(invalidUsers.success, false);

  const invalidClientes = listClientesQuerySchema.safeParse({ ativo: 'x' });
  assert.equal(invalidClientes.success, false);

  const validProcessos = listProcessosQuerySchema.parse({
    prazoDe: '2026-10-01',
    prazoAte: '2026-10-10',
  });
  assert.equal(validProcessos.page, 1);
  assert.equal(validProcessos.limit, 20);
});
