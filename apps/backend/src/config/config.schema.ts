import * as Joi from 'joi';
import { resolve } from 'node:path';

export const configValidationSchema = Joi.object({
  PORT: Joi.number().default(3000),

  // Gotenberg configuration
  GOTENBERG_URL: Joi.string().uri().default('http://localhost:3001'),

  // Redis configuration
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),

  // Database configuration
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().default('arcivo'),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().default('arcivo'),

  // Authentication configuration
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_TOKEN_TTL: Joi.string()
    .pattern(/^\d+[smhd]$/)
    .default('15m'),

  // Keep uploaded files outside the application directory so app relocations
  // and rebuilds do not make existing documents unavailable.
  STORAGE_ROOT: Joi.string().default(
    resolve(__dirname, '../../../../data/library'),
  ),
});
