import { z } from 'zod';

export const uuidSchema = z.uuid();
export const isoDateTimeSchema = z.iso.datetime({ offset: true });

export const idParamsSchema = z
  .object({
    id: uuidSchema,
  })
  .strict();
export type IdParams = z.infer<typeof idParamsSchema>;

export const apiErrorResponseSchema = z.object({
  message: z.union([z.string(), z.array(z.string())]),
  error: z.string().optional(),
  statusCode: z.number().int().optional(),
  errors: z.unknown().optional(),
});
export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>;
