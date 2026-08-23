import { z } from 'zod';

export const loginRequestSchema = z.object({
  email: z.email().max(320),
  password: z.string().min(8).max(128),
}).strict();
export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const accessTokenResponseSchema = z.object({
  accessToken: z.string().min(1),
});
export type AccessTokenResponse = z.infer<typeof accessTokenResponseSchema>;
