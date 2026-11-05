import dotenv from 'dotenv';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { validateProductionSeed, applyProductionSeed } from './production-seed.js';
import { hashPassword } from '../services/authService.js';

// Resolve the project's .env even when invoked from another directory.
dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)), override: true });

let prisma;
try {
  const args = process.argv.slice(2);
  if (args.length > 1 || args.some((arg) => !['--check', '--apply'].includes(arg))) {
    throw new Error('Use npm run seed:production para carregar ou acrescente -- --check para somente validar.');
  }
  const file = fileURLToPath(new URL('./seed.production.json', import.meta.url));
  let input;
  try { input = JSON.parse(await readFile(file, 'utf8')); }
  catch { throw new Error('Crie prisma/seed.production.json a partir de seed.production.example.json e confira o JSON.'); }
  const data = validateProductionSeed(input, process.env);
  console.log('Carga validada:', { users: data.users.length, clientes: data.clientes.length, processos: data.processos.length });
  if (args.includes('--check')) {
    console.log('Validação local concluída. Nenhuma conexão/gravação no banco. Para aplicar: npm run seed:production');
  } else {
    const { PrismaClient } = await import('@prisma/client');
    prisma = new PrismaClient();
    const result = await applyProductionSeed(prisma, data, process.env, hashPassword);
    console.log('Carga concluída:', result);
  }
} catch (error) {
  // Prisma messages may include private data from a failed insert; log only its code.
  console.error('Falha na carga:', error.name?.startsWith('Prisma') ? `Prisma ${error.code || 'erro de conexão/consulta'}; verifique conexão, migrations e conflitos de registros.` : error.message);
  process.exitCode = 1;
} finally {
  if (prisma) await prisma.$disconnect();
}
