import { z } from 'zod';
import { isoDateTimeSchema, uuidSchema } from './common';

const emailSchema = z.email().max(320);
const displayNameSchema = z
  .string()
  .min(1)
  .max(100)
  .refine((value) => /\S/.test(value), 'displayName must contain a non-space character');
const passwordSchema = z.string().min(8).max(128);

export const createUserRequestSchema = z
  .object({
    email: emailSchema,
    displayName: displayNameSchema,
    password: passwordSchema,
  })
  .strict();
export type CreateUserRequest = z.infer<typeof createUserRequestSchema>;

export const updateUserRequestSchema = z
  .object({
    email: emailSchema.optional(),
    displayName: displayNameSchema.optional(),
    isAdmin: z.boolean().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, 'At least one field must be provided');
export type UpdateUserRequest = z.infer<typeof updateUserRequestSchema>;

export const resetUserPasswordRequestSchema = z
  .object({
    password: passwordSchema,
  })
  .strict();
export type ResetUserPasswordRequest = z.infer<typeof resetUserPasswordRequestSchema>;

export const userResponseSchema = z.object({
  id: uuidSchema,
  email: emailSchema,
  displayName: z.string(),
  isAdmin: z.boolean(),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});
export type UserResponse = z.infer<typeof userResponseSchema>;

export const usersResponseSchema = z.array(userResponseSchema);
export type UsersResponse = z.infer<typeof usersResponseSchema>;
