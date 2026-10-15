import assert from 'node:assert/strict';
import { randomBytes, randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import { after, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import request from 'supertest';

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const testDatabaseName = `lexflow-test-${process.pid}-${randomUUID()}.db`;
const testDatabasePath = path.join(backendRoot, 'prisma', testDatabaseName);
const testPassword = () => `${randomBytes(24).toString('base64url')}Aa7!`;

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = randomBytes(48).toString('hex');
process.env.CORS_ALLOWED_ORIGINS = 'http://localhost:5173';
process.env.DATABASE_URL = `file:./${testDatabaseName}`;

execFileSync(process.execPath, [
  path.join(backendRoot, 'node_modules', 'prisma', 'build', 'index.js'),
  'db',
  'push',
  '--schema',
  path.join(backendRoot, 'prisma', 'schema.prisma'),
  '--skip-generate',
], {
  cwd: backendRoot,
  env: process.env,
  stdio: 'inherit',
});

const [{ app }, { prisma }, { hashPassword, comparePassword }] = await Promise.all([
  import('../../server.js'),
  import('../../db.js'),
  import('../../services/authService.js'),
]);

after(async () => {
  await prisma.$disconnect();
  for (const suffix of ['', '-journal', '-shm', '-wal']) {
    const filePath = `${testDatabasePath}${suffix}`;
    if (existsSync(filePath)) rmSync(filePath, { force: true });
  }
});

test('health endpoint works without auth', async () => {
  const res = await request(app).get('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'OK');
});

test('registration, login, password hashing, role checks, and tenant isolation work', async () => {
  const registrationPassword = testPassword();
  const registeredEmail = `registered-${randomUUID()}@example.test`;
  const registration = await request(app)
    .post('/api/auth/register')
    .send({
      email: registeredEmail,
      password: registrationPassword,
      nome: 'Usuário Fictício',
      perfil: 'admin',
    });

  assert.equal(registration.status, 201);
  assert.equal(registration.body.user.perfil, 'usuario');
  assert.ok(registration.body.token);

  const storedRegisteredUser = await prisma.user.findUnique({ where: { email: registeredEmail } });
  assert.ok(storedRegisteredUser.password.startsWith('$2'));
  assert.notEqual(storedRegisteredUser.password, registrationPassword);
  assert.equal(await comparePassword(registrationPassword, storedRegisteredUser.password), true);

  const successfulLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: registeredEmail, password: registrationPassword });
  assert.equal(successfulLogin.status, 200);

  const failedLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: registeredEmail, password: testPassword() });
  assert.equal(failedLogin.status, 401);

  const unauthenticatedUsers = await request(app).get('/api/users');
  assert.equal(unauthenticatedUsers.status, 401);

  const adminPassword = testPassword();
  const admin = await prisma.user.create({
    data: {
      email: `admin-${randomUUID()}@example.test`,
      password: await hashPassword(adminPassword),
      nome: 'Administrador Fictício',
      perfil: 'admin',
    },
  });
  const adminLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: admin.email, password: adminPassword });
  assert.equal(adminLogin.status, 200);
  const adminAuth = `Bearer ${adminLogin.body.token}`;

  const lawyer1Password = testPassword();
  const lawyer1Create = await request(app)
    .post('/api/users')
    .set('Authorization', adminAuth)
    .send({
      email: `lawyer1-${randomUUID()}@example.test`,
      password: lawyer1Password,
      nome: 'Advogado Fictício 1',
      perfil: 'advogado',
    });
  assert.equal(lawyer1Create.status, 201);
  assert.equal(lawyer1Create.body.perfil, 'advogado');

  const lawyer2Password = testPassword();
  const lawyer2Create = await request(app)
    .post('/api/users')
    .set('Authorization', adminAuth)
    .send({
      email: `lawyer2-${randomUUID()}@example.test`,
      password: lawyer2Password,
      nome: 'Advogado Fictício 2',
      perfil: 'advogado',
    });
  assert.equal(lawyer2Create.status, 201);

  const [lawyer1Login, lawyer2Login] = await Promise.all([
    request(app).post('/api/auth/login').send({ email: lawyer1Create.body.email, password: lawyer1Password }),
    request(app).post('/api/auth/login').send({ email: lawyer2Create.body.email, password: lawyer2Password }),
  ]);
  assert.equal(lawyer1Login.status, 200);
  assert.equal(lawyer2Login.status, 200);
  const lawyer1Auth = `Bearer ${lawyer1Login.body.token}`;
  const lawyer2Auth = `Bearer ${lawyer2Login.body.token}`;

  assert.equal((await request(app).get('/api/users').set('Authorization', lawyer1Auth)).status, 403);
  assert.equal((await request(app).get('/api/users').set('Authorization', adminAuth)).status, 200);
  const searchedUsers = await request(app)
    .get('/api/users')
    .query({ search: lawyer1Create.body.email })
    .set('Authorization', adminAuth);
  assert.equal(searchedUsers.status, 200);
  assert.equal(searchedUsers.body.data.some((user) => user.email === lawyer1Create.body.email), true);

  const clientPayload = {
    nome: 'Cliente Fictício de Teste',
    cpfCnpj: '52998224725',
    email: '',
    telefone: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    observacoes: '',
  };
  const invalidUf = await request(app)
    .post('/api/clientes')
    .set('Authorization', lawyer1Auth)
    .send({ ...clientPayload, estado: 'sp' });
  assert.equal(invalidUf.status, 400);
  assert.deepEqual(invalidUf.body.error.details, [{ field: 'estado', message: 'UF deve conter 2 letras' }]);

  const clientCreate = await request(app)
    .post('/api/clientes')
    .set('Authorization', lawyer1Auth)
    .send(clientPayload);
  assert.equal(clientCreate.status, 201);
  const clientId = clientCreate.body.id;
  const persistedClients = await request(app).get('/api/clientes').set('Authorization', lawyer1Auth);
  const persistedClient = persistedClients.body.data.find((client) => client.id === clientId);
  assert.ok(persistedClient);
  assert.equal(persistedClient.email, null);

  const deactivateClient = await request(app)
    .patch(`/api/clientes/${clientId}`)
    .set('Authorization', lawyer1Auth)
    .send({ ativo: false });
  assert.equal(deactivateClient.status, 200);
  const reactivateClient = await request(app)
    .patch(`/api/clientes/${clientId}`)
    .set('Authorization', lawyer1Auth)
    .send({ ativo: true });
  assert.equal(reactivateClient.status, 200);
  assert.equal(reactivateClient.body.ativo, true);

  const processCreate = await request(app)
    .post('/api/processos')
    .set('Authorization', lawyer1Auth)
    .send({
      titulo: 'Processo Fictício de Teste',
      area: 'Direito Civil',
      prazo: '2099-01-01',
      clienteId: clientId,
    });
  assert.equal(processCreate.status, 201);
  const processId = processCreate.body.id;
  const searchedClient = await request(app)
    .get('/api/clientes')
    .query({ search: 'Fictício' })
    .set('Authorization', lawyer1Auth);
  assert.equal(searchedClient.status, 200);
  assert.equal(searchedClient.body.data.some((client) => client.id === clientId), true);
  const searchedProcess = await request(app)
    .get('/api/processos')
    .query({ search: 'Fictício' })
    .set('Authorization', lawyer1Auth);
  assert.equal(searchedProcess.status, 200);
  assert.equal(searchedProcess.body.data.some((process) => process.id === processId), true);

  const lawyer2Clients = await request(app).get('/api/clientes').set('Authorization', lawyer2Auth);
  const lawyer2Processes = await request(app).get('/api/processos').set('Authorization', lawyer2Auth);
  assert.deepEqual(lawyer2Clients.body.data, []);
  assert.deepEqual(lawyer2Processes.body.data, []);

  assert.equal((await request(app).get(`/api/clientes/${clientId}`).set('Authorization', lawyer2Auth)).status, 404);
  assert.equal((await request(app).patch(`/api/clientes/${clientId}`).set('Authorization', lawyer2Auth).send({ nome: 'Acesso indevido' })).status, 404);
  assert.equal((await request(app).delete(`/api/clientes/${clientId}`).set('Authorization', lawyer2Auth)).status, 404);
  assert.equal((await request(app).get(`/api/processos/${processId}`).set('Authorization', lawyer2Auth)).status, 404);
  assert.equal((await request(app).patch(`/api/processos/${processId}`).set('Authorization', lawyer2Auth).send({ titulo: 'Acesso indevido' })).status, 404);
  assert.equal((await request(app).delete(`/api/processos/${processId}`).set('Authorization', lawyer2Auth)).status, 404);

  const foreignClientProcess = await request(app)
    .post('/api/processos')
    .set('Authorization', lawyer2Auth)
    .send({
      titulo: 'Processo sem acesso',
      area: 'Direito Civil',
      prazo: '2099-01-01',
      clienteId: clientId,
    });
  assert.equal(foreignClientProcess.status, 404);

  assert.equal((await request(app).get(`/api/clientes/${clientId}`).set('Authorization', adminAuth)).status, 404);
  assert.equal((await request(app).get(`/api/processos/${processId}`).set('Authorization', adminAuth)).status, 404);

  const ownClients = await request(app).get('/api/clientes').set('Authorization', lawyer1Auth);
  const ownProcesses = await request(app).get('/api/processos').set('Authorization', lawyer1Auth);
  assert.equal(ownClients.body.data.some((client) => client.id === clientId), true);
  assert.equal(ownProcesses.body.data.some((process) => process.id === processId), true);
});

test('invalid token, unknown route, and disallowed origin retain expected responses', async () => {
  const invalidToken = await request(app)
    .get('/api/users')
    .set('Authorization', 'Bearer invalid-token');
  assert.equal(invalidToken.status, 401);
  assert.equal(invalidToken.body.error.code, 'INVALID_TOKEN');

  const notFound = await request(app).get('/api/rota-que-nao-existe');
  assert.equal(notFound.status, 404);
  assert.equal(notFound.body.error.code, 'NOT_FOUND');

  const cors = await request(app)
    .get('/api/health')
    .set('Origin', 'https://not-allowed.example');
  assert.equal(cors.status, 403);
});
