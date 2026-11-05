import { createHash } from 'node:crypto';
import { z } from 'zod';
import { createUserSchema, clienteSchema, processoSchema } from '../utils/validation.js';
import { parseDateOnly } from '../utils/date.js';

const key = z.string().regex(/^[a-z0-9][a-z0-9_-]{0,63}$/);
const userSchema = createUserSchema.omit({ password: true, perfil: true }).extend({
  key,
  perfil: z.enum(['admin', 'advogado', 'usuario']),
  passwordEnv: z.string().regex(/^LEXFLOW_PROD_[A-Z0-9_]+_PASSWORD$/),
}).strict();
const clientSchema = clienteSchema.extend({ key, userKey: key }).strict();
const caseSchema = processoSchema.omit({ clienteId: true, prazo: true }).extend({
  key, userKey: key, clienteKey: key,
  prazo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
    const date = new Date(`${value}T12:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }, 'Prazo deve ser uma data existente no formato YYYY-MM-DD'),
}).strict();
const payloadSchema = z.object({
  users: z.array(userSchema).min(1).max(500),
  clientes: z.array(clientSchema).max(500).default([]),
  processos: z.array(caseSchema).max(500).default([]),
}).strict();

export const seedId = (kind, value) => `seedprod_${kind}_${createHash('sha256').update(value).digest('hex').slice(0, 32)}`;

const unique = (values, label) => {
  if (new Set(values).size !== values.length) throw new Error(`${label}: valores duplicados no arquivo.`);
};

export function validateProductionSeed(input, env) {
  const result = payloadSchema.safeParse(input);
  if (!result.success) {
    // Report paths, never private payloads or passwords.
    throw new Error(`Dados inválidos nos campos: ${result.error.issues.map((issue) => issue.path.join('.')).join(', ')}`);
  }
  const data = result.data;
  for (const user of data.users) user.email = user.email.toLowerCase();
  for (const group of ['users', 'clientes', 'processos']) unique(data[group].map((row) => row.key), `${group}.key`);
  unique(data.users.map((user) => user.email), 'users.email');
  unique(data.users.map((user) => user.passwordEnv), 'users.passwordEnv');
  unique(data.clientes.map((client) => `${client.userKey}:${client.cpfCnpj}`), 'clientes CPF/CNPJ por usuário');
  if (!data.users.some((user) => user.perfil === 'admin' && user.ativo !== false)) {
    throw new Error('Informe pelo menos um administrador ativo.');
  }
  for (const user of data.users) {
    const password = env[user.passwordEnv];
    if (typeof password !== 'string' || password !== password.trim() || password.length < 8 || Buffer.byteLength(password, 'utf8') > 72 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z\d]/.test(password)) {
      throw new Error(`${user.passwordEnv}: preencha com 8+ caracteres, até 72 bytes UTF-8, maiúscula, minúscula, número e símbolo, sem espaços nas extremidades.`);
    }
  }
  unique(data.users.map((user) => env[user.passwordEnv]), 'Senhas dos usuários');
  const users = new Map(data.users.map((user) => [user.key, user]));
  const clients = new Map(data.clientes.map((client) => [client.key, client]));
  for (const row of [...data.clientes, ...data.processos]) {
    if (!users.has(row.userKey) || users.get(row.userKey).ativo === false) throw new Error('Cliente/processo deve referenciar um usuário ativo presente no arquivo.');
  }
  for (const row of data.processos) {
    if (!clients.has(row.clienteKey) || clients.get(row.clienteKey).userKey !== row.userKey) {
      throw new Error('Processo deve referenciar um cliente do mesmo usuário presente no arquivo.');
    }
  }
  return data;
}

export function validateProductionTarget(env) {
  let url;
  try { url = new URL(env.DATABASE_URL); } catch { throw new Error('DATABASE_URL inválida.'); }
  if (url.protocol !== 'mysql:' || !url.hostname || url.pathname.length < 2) throw new Error('DATABASE_URL deve apontar para um banco MySQL.');
}

export async function applyProductionSeed(db, data, env, hashPassword) {
  validateProductionTarget(env);
  // Hash outside the transaction, avoiding bcrypt work while holding DB locks.
  const hashes = new Map(await Promise.all(data.users.map(async (user) => [user.key, await hashPassword(env[user.passwordEnv])])));
  return db.$transaction(async (tx) => {
    const summary = { users: { created: 0, preserved: 0 }, clientes: { created: 0, preserved: 0 }, processos: { created: 0, preserved: 0 } };
    const users = new Map();
    const clients = new Map();
    for (const { key: userKey, passwordEnv, ...fields } of data.users) {
      let user = await tx.user.findUnique({ where: { email: fields.email } });
      if (user) {
        if (user.perfil !== fields.perfil || user.ativo !== (fields.ativo ?? true)) throw new Error('Usuário existente possui perfil/status diferente. Revise a carga; nenhuma promoção ou reativação automática é permitida.');
        summary.users.preserved++;
      } else {
        user = await tx.user.create({ data: { ...fields, id: seedId('user', userKey), password: hashes.get(userKey) } });
        summary.users.created++;
      }
      users.set(userKey, user.id);
    }
    for (const { key: clientKey, userKey, ...fields } of data.clientes) {
      const userId = users.get(userKey);
      let client = await tx.cliente.findUnique({ where: { userId_cpfCnpj: { userId, cpfCnpj: fields.cpfCnpj } } });
      if (client) summary.clientes.preserved++;
      else {
        client = await tx.cliente.create({ data: { ...fields, userId, id: seedId('cliente', clientKey) } });
        summary.clientes.created++;
      }
      clients.set(clientKey, client.id);
    }
    for (const { key: processKey, userKey, clienteKey, prazo, ...fields } of data.processos) {
      const id = seedId('processo', processKey);
      const userId = users.get(userKey);
      const clienteId = clients.get(clienteKey);
      const existing = await tx.processo.findUnique({ where: { id } });
      if (existing) {
        if (existing.userId !== userId || existing.clienteId !== clienteId) throw new Error('Chave de processo já vinculada a outro usuário/cliente.');
        summary.processos.preserved++;
      } else {
        await tx.processo.create({ data: { ...fields, id, userId, clienteId, prazo: parseDateOnly(`${prazo}T12:00:00`) } });
        summary.processos.created++;
      }
    }
    return summary;
  }, { timeout: 60000, isolationLevel: 'Serializable' });
}
