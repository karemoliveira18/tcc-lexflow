import assert from 'node:assert/strict';
import test from 'node:test';
import { randomBytes } from 'node:crypto';
import { validateProductionSeed, validateProductionTarget, applyProductionSeed } from '../../prisma/production-seed.js';

const fixture = () => ({
  users: [{ key: 'admin', nome: 'Administrador', email: 'admin@example.test', perfil: 'admin', passwordEnv: 'LEXFLOW_PROD_ADMIN_PASSWORD' }],
  clientes: [{ key: 'cliente', userKey: 'admin', nome: 'Cliente de teste', cpfCnpj: '529.982.247-25' }],
  processos: [{ key: 'processo', userKey: 'admin', clienteKey: 'cliente', titulo: 'Processo de teste', area: 'Civil', prazo: '2027-02-28' }],
});
const environment = () => ({
  DATABASE_URL: 'mysql://test:test@localhost/seed_unit_test',
  LEXFLOW_PROD_ADMIN_PASSWORD: `${randomBytes(24).toString('hex')}Aa7!`,
});

function fakeDatabase() {
  const rows = { user: [], cliente: [], processo: [] };
  const tx = Object.fromEntries(Object.keys(rows).map((table) => [table, {
    async findUnique({ where }) {
      const fields = where.userId_cpfCnpj || where;
      return rows[table].find((row) => Object.entries(fields).every(([key, value]) => row[key] === value)) || null;
    },
    async create({ data }) {
      if (rows[table].some((row) => row.id === data.id)) throw new Error('ID collision');
      const row = { ativo: true, ...data }; rows[table].push(row); return row;
    },
  }]));
  return {
    rows,
    async $transaction(callback, options) {
      assert.equal(options.isolationLevel, 'Serializable');
      const before = structuredClone(rows);
      try { return await callback(tx); }
      catch (error) { Object.assign(rows, before); throw error; }
    },
  };
}

test('production seed validates all models, dates, CPF and ownership before writing', () => {
  const env = environment();
  assert.equal(validateProductionSeed(fixture(), env).clientes[0].cpfCnpj, '52998224725');
  for (const mutate of [
    (data) => { data.processos[0].prazo = '2027-02-30'; },
    (data) => { data.clientes[0].cpfCnpj = '11111111111'; },
    (data) => { data.processos[0].userKey = 'missing'; },
    (data) => { data.processos[0].clienteKey = 'missing'; },
    (data) => { data.users[0].perfil = 'invalid'; },
    (data) => { data.users[0].ativo = false; },
    (data) => { data.users.push({ ...data.users[0] }); },
  ]) {
    const input = fixture(); mutate(input);
    assert.throws(() => validateProductionSeed(input, env));
  }
});

test('production seed rejects missing, weak or bcrypt-truncated passwords', () => {
  for (const password of [undefined, 'short', 'Aa1!' + 'x'.repeat(70), 'Aa1!' + 'é'.repeat(35)]) {
    assert.throws(() => validateProductionSeed(fixture(), { ...environment(), LEXFLOW_PROD_ADMIN_PASSWORD: password }));
  }
});

test('production seed only requires a valid MySQL DATABASE_URL for its target', () => {
  assert.doesNotThrow(() => validateProductionTarget(environment()));
  assert.doesNotThrow(() => validateProductionTarget({ ...environment(), NODE_ENV: 'development' }));
  for (const patch of [{ DATABASE_URL: undefined }, { DATABASE_URL: 'mysql://localhost/' }, { DATABASE_URL: 'file:dev.db' }]) {
    assert.throws(() => validateProductionTarget({ ...environment(), ...patch }));
  }
});

test('repeated production seed preserves existing data, passwords and relationships', async () => {
  const env = environment(); const db = fakeDatabase();
  const data = validateProductionSeed(fixture(), env);
  const first = await applyProductionSeed(db, data, env, async () => 'hashed-in-test');
  assert.equal(first.users.created, 1);
  assert.equal(first.clientes.created, 1);
  assert.equal(first.processos.created, 1);
  db.rows.user[0].password = 'changed-by-user';
  db.rows.cliente[0].nome = 'Edited after import';
  const before = structuredClone(db.rows);
  const repeated = await applyProductionSeed(db, data, env, async () => 'different-hash');
  assert.equal(repeated.users.preserved, 1);
  assert.equal(repeated.clientes.preserved, 1);
  assert.equal(repeated.processos.preserved, 1);
  assert.deepEqual(db.rows, before);
  assert.equal(db.rows.processo[0].userId, db.rows.cliente[0].userId);
  assert.equal(db.rows.processo[0].clienteId, db.rows.cliente[0].id);
});

test('existing user is never promoted or reactivated by the seed', async () => {
  const env = environment(); const db = fakeDatabase();
  db.rows.user.push({ id: 'existing', email: 'admin@example.test', perfil: 'usuario', ativo: true });
  await assert.rejects(applyProductionSeed(db, validateProductionSeed(fixture(), env), env, async () => 'hash'), /perfil\/status/);
  assert.equal(db.rows.user[0].perfil, 'usuario');
  assert.equal(db.rows.cliente.length, 0);
});

test('a conflicting process binding aborts the transaction', async () => {
  const env = environment(); const db = fakeDatabase(); const data = validateProductionSeed(fixture(), env);
  await applyProductionSeed(db, data, env, async () => 'hash');
  db.rows.processo[0].userId = 'other-owner';
  data.clientes.push({ ...data.clientes[0], key: 'second', cpfCnpj: '11222333000181' });
  await assert.rejects(applyProductionSeed(db, data, env, async () => 'hash'), /outro usuário\/cliente/);
  assert.equal(db.rows.cliente.length, 1);
});
