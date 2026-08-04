import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  PORT: Joi.number().default(3000),

  // Gotenberg configuration
  GOTENBERG_URL: Joi.string().uri().default('http://gotenberg:3000'),

  // Redis configuration
  REDIS_HOST: Joi.string().default('redis'),
  REDIS_PORT: Joi.number().default(6379),

  // Database configuration
  DB_HOST: Joi.string().default('database'),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().default('arcivo'),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().default('arcivo'),

  // Authentication configuration
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_TOKEN_TTL: Joi.string()
    .pattern(/^\d+[smhd]$/)
    .default('15m'),
});
