import { z } from 'zod';

const MAX_TEXT_LENGTH = 191;
const CEP_REGEX = /^\d{5}-?\d{3}$/;
const UF_REGEX = /^[A-Z]{2}$/;
const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$/;

const isValidDateInput = (value) => DATE_ONLY_REGEX.test(value) || ISO_DATE_REGEX.test(value) || !Number.isNaN(new Date(value).getTime());

const normalizeString = (value) => {
  if (typeof value !== 'string') return value;
  return value.trim();
};

const stringLength = (fieldName, min, max) =>
  z.string({ required_error: `${fieldName} é obrigatório`, invalid_type_error: `${fieldName} deve ser texto` })
    .transform(normalizeString)
    .refine((value) => value.length >= min && value.length <= max, {
      message: `${fieldName} deve ter entre ${min} e ${max} caracteres`,
    });

const digitsOnly = (value) => value.replace(/\D/g, '');

const cpfCnpjSchema = z
  .string({ required_error: 'CPF/CNPJ é obrigatório', invalid_type_error: 'CPF/CNPJ deve ser texto' })
  .transform(normalizeString)
  .refine((value) => value.length === 11 || value.length === 14 || /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(value) || /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(value), {
    message: 'CPF/CNPJ deve conter 11 ou 14 dígitos',
  })
  .transform((value) => digitsOnly(value))
  .refine((value) => value.length === 11 || value.length === 14, {
    message: 'CPF/CNPJ deve conter 11 ou 14 dígitos',
  })
  .refine((value) => {
    const digits = digitsOnly(value);
    if (!digits || (digits.length !== 11 && digits.length !== 14)) return false;

    if (digits.length === 11) {
      if (/^(\d)\1{10}$/.test(digits)) return false;

      let sum = 0;
      for (let i = 0; i < 9; i += 1) sum += Number(digits[i]) * (10 - i);
      let digit1 = 11 - (sum % 11);
      if (digit1 >= 10) digit1 = 0;
      if (Number(digits[9]) !== digit1) return false;

      sum = 0;
      for (let i = 0; i < 10; i += 1) sum += Number(digits[i]) * (11 - i);
      let digit2 = 11 - (sum % 11);
      if (digit2 >= 10) digit2 = 0;
      return Number(digits[10]) === digit2;
    }

    if (/^(\d)\1{13}$/.test(digits)) return false;

    const multipliers1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const multipliers2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    let sum = 0;
    for (let i = 0; i < 12; i += 1) sum += Number(digits[i]) * multipliers1[i];
    let digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (Number(digits[12]) !== digit1) return false;

    sum = 0;
    for (let i = 0; i < 13; i += 1) sum += Number(digits[i]) * multipliers2[i];
    let digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return Number(digits[13]) === digit2;
  }, {
    message: 'CPF/CNPJ inválido',
  });

const allowedProfiles = ['admin', 'advogado', 'usuario'];
const allowedStatuses = ['ativo', 'aguardando', 'concluído', 'suspenso'];
const allowedPriorities = ['baixa', 'normal', 'alta'];

const emailSchema = z.string({ required_error: 'Email é obrigatório', invalid_type_error: 'Email deve ser texto' })
  .transform(normalizeString)
  .refine((value) => value.length <= 191, { message: 'Email deve ter no máximo 191 caracteres' })
  .refine((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), { message: 'Email inválido' });

const passwordSchema = z.string({ required_error: 'Senha é obrigatória', invalid_type_error: 'Senha deve ser texto' })
  .transform(normalizeString)
  .refine((value) => value.length >= 8, { message: 'Senha deve ter pelo menos 8 caracteres' })
  .refine((value) => value.length <= 191, { message: 'Senha deve ter no máximo 191 caracteres' });

const nameSchema = stringLength('Nome', 2, 191);
const titleSchema = stringLength('Título', 2, 191);

const optionalTextSchema = z.union([
  z.string().transform(normalizeString).refine((value) => value.length <= MAX_TEXT_LENGTH, {
    message: `Texto deve ter no máximo ${MAX_TEXT_LENGTH} caracteres`,
  }),
  z.literal(''),
  z.null(),
]).optional();

const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  nome: nameSchema,
  perfil: z.enum(['admin', 'advogado', 'usuario']).optional().catch('usuario'),
}).strict().transform((data) => ({
  ...data,
  perfil: 'usuario',
}));

const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
}).strict();

const profileSchema = z.object({
  nome: nameSchema.optional(),
  email: emailSchema.optional(),
  perfil: z.enum(['admin', 'advogado', 'usuario']).optional(),
  ativo: z.boolean().optional(),
}).strict();

const createUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  nome: nameSchema,
  perfil: z.enum(['admin', 'advogado', 'usuario']).optional().catch('usuario'),
  ativo: z.boolean().optional(),
}).strict();

const updateUserSchema = z.object({
  email: emailSchema.optional(),
  password: passwordSchema.optional(),
  nome: nameSchema.optional(),
  perfil: z.enum(['admin', 'advogado', 'usuario']).optional(),
  ativo: z.boolean().optional(),
}).strict();

const clienteSchema = z.object({
  nome: nameSchema,
  cpfCnpj: cpfCnpjSchema,
  email: z.union([emailSchema, z.literal(''), z.null()]).optional(),
  telefone: optionalTextSchema,
  endereco: optionalTextSchema,
  cidade: optionalTextSchema,
  estado: z.union([
    z.string().transform(normalizeString).refine((value) => UF_REGEX.test(value), { message: 'UF deve conter 2 letras' }),
    z.literal(''),
    z.null(),
  ]).optional(),
  cep: z.union([
    z.string().transform(normalizeString).refine((value) => CEP_REGEX.test(value), { message: 'CEP inválido' }),
    z.literal(''),
    z.null(),
  ]).optional(),
  observacoes: optionalTextSchema,
  ativo: z.boolean().optional(),
}).strict();

const processoSchema = z.object({
  titulo: titleSchema,
  area: stringLength('Área', 2, 191),
  prazo: z.string({ required_error: 'Prazo é obrigatório', invalid_type_error: 'Prazo deve ser texto no formato YYYY-MM-DD' })
    .transform(normalizeString)
    .refine((value) => isValidDateInput(value), { message: 'Data inválida. Use o formato YYYY-MM-DD ou ISO-8601' }),
  status: z.enum(['ativo', 'aguardando', 'concluído', 'suspenso']).optional().default('ativo'),
  descricao: optionalTextSchema,
  prioridade: z.enum(['baixa', 'normal', 'alta']).optional().default('normal'),
  clienteId: z.string({ required_error: 'clienteId é obrigatório', invalid_type_error: 'clienteId deve ser texto' }).min(1, 'clienteId é obrigatório'),
}).strict();

const idParamSchema = z.object({ id: z.string().min(1, 'ID é obrigatório') });

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).strict();

const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(191).optional(),
  perfil: z.enum(['admin', 'advogado', 'usuario']).optional(),
  ativo: z.enum(['true', 'false']).optional(),
}).strict();

const listClientesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(191).optional(),
  ativo: z.enum(['true', 'false']).optional(),
}).strict();

const listProcessosQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(191).optional(),
  status: z.enum(['ativo', 'aguardando', 'concluído', 'suspenso']).optional(),
  prioridade: z.enum(['baixa', 'normal', 'alta']).optional(),
  area: z.string().trim().max(191).optional(),
  clienteId: z.string().min(1).optional(),
  prazoDe: z.string().refine((value) => isValidDateInput(value), { message: 'prazoDe deve ser uma data válida no formato YYYY-MM-DD ou ISO-8601' }).optional(),
  prazoAte: z.string().refine((value) => isValidDateInput(value), { message: 'prazoAte deve ser uma data válida no formato YYYY-MM-DD ou ISO-8601' }).optional(),
}).strict();

const validateData = (schema, value) => schema.safeParse(value);

export {
  allowedProfiles,
  allowedStatuses,
  allowedPriorities,
  validateData,
  registerSchema,
  loginSchema,
  profileSchema,
  createUserSchema,
  updateUserSchema,
  clienteSchema,
  processoSchema,
  idParamSchema,
  paginationSchema,
  listUsersQuerySchema,
  listClientesQuerySchema,
  listProcessosQuerySchema,
  cpfCnpjSchema,
  emailSchema,
  passwordSchema,
  nameSchema,
  titleSchema,
  optionalTextSchema,
};
