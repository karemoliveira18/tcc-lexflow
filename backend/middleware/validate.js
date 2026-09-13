import { ZodError } from 'zod';
import { sendError } from '../utils/http.js';

const normalizeIssue = (issue) => {
  const path = issue.path && issue.path.length > 0 ? issue.path.join('.') : 'body';
  return {
    field: path,
    message: issue.message,
  };
};

const validate = (schema, source = 'body') => (req, res, next) => {
  try {
    const target = req[source];
    const result = schema.safeParse(target);

    if (!result.success) {
      const details = result.error.issues.map(normalizeIssue);
      const validationError = {
        code: 'VALIDATION_ERROR',
        details,
      };
      return sendError(res, {
        status: 400,
        code: 'VALIDATION_ERROR',
        message: 'Dados inválidos',
        details,
      });
    }

    req[source] = result.data;
    return next();
  } catch (error) {
    if (error instanceof ZodError) {
      return sendError(res, {
        status: 400,
        code: 'VALIDATION_ERROR',
        message: 'Dados inválidos',
        details: error.issues.map(normalizeIssue),
      });
    }

    console.error(`Validation middleware error for ${source}:`, error);
    return sendError(res, {
      status: 500,
      code: 'INTERNAL_ERROR',
      message: 'Erro interno do servidor',
      details: [],
    });
  }
};

const validateBody = (schema) => validate(schema, 'body');
const validateParams = (schema) => validate(schema, 'params');
const validateQuery = (schema) => validate(schema, 'query');

export { validate, validateBody, validateParams, validateQuery };
