import { z } from 'zod';
import { isoDateTimeSchema, uuidSchema } from './common';

export const DOCUMENT_UPLOAD_STATUSES = ['created', 'duplicate'] as const;
export const documentUploadStatusSchema = z.enum(DOCUMENT_UPLOAD_STATUSES);
export type DocumentUploadStatus = z.infer<typeof documentUploadStatusSchema>;

export const DOCUMENT_MATCH_TYPES = ['filename', 'content', 'both'] as const;
export const documentMatchTypeSchema = z.enum(DOCUMENT_MATCH_TYPES);
export type DocumentMatchType = z.infer<typeof documentMatchTypeSchema>;

export const serializedBufferSchema = z.object({
  type: z.literal('Buffer'),
  data: z.array(z.number().int().min(0).max(255)),
});
export type SerializedBuffer = z.infer<typeof serializedBufferSchema>;

export const documentUploadRequestSchema = z
  .object({
    fileCreatedAt: isoDateTimeSchema.optional(),
  })
  .strict();
export type DocumentUploadRequest = z.infer<typeof documentUploadRequestSchema>;

export const updateDocumentRequestSchema = z
  .object({
    name: z
      .string()
      .max(255)
      .refine((value) => /\S/.test(value), 'name must contain a non-space character')
      .refine((value) => !/[/\\]/.test(value), 'name must not contain path separators')
      .optional(),
    fileCreatedAt: isoDateTimeSchema.optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, 'At least one document field is required');
export type UpdateDocumentRequest = z.infer<typeof updateDocumentRequestSchema>;

export const documentSummaryResponseSchema = z.object({
  id: uuidSchema,
  name: z.string(),
  size: z.number().nonnegative(),
  mimeType: z.string(),
  fileCreatedAt: isoDateTimeSchema,
  createdAt: isoDateTimeSchema,
  hasThumbnail: z.boolean(),
});
export type DocumentSummaryResponse = z.infer<typeof documentSummaryResponseSchema>;

export const documentResponseSchema = documentSummaryResponseSchema.extend({
  checksum: serializedBufferSchema,
  extension: z.string(),
  ownerId: uuidSchema,
  textContent: z.string().nullable(),
});
export type DocumentResponse = z.infer<typeof documentResponseSchema>;

export const documentsResponseSchema = z.array(documentSummaryResponseSchema);
export type DocumentsResponse = z.infer<typeof documentsResponseSchema>;

export const documentSearchQuerySchema = z
  .object({
    q: z.string().trim().min(1, 'Query parameter "q" is required'),
  })
  .strict();
export type DocumentSearchQuery = z.infer<typeof documentSearchQuerySchema>;

export const documentSearchResultResponseSchema = documentSummaryResponseSchema.extend({
  matchType: documentMatchTypeSchema,
});
export type DocumentSearchResultResponse = z.infer<typeof documentSearchResultResponseSchema>;

export const documentSearchResultsResponseSchema = z.array(documentSearchResultResponseSchema);
export type DocumentSearchResultsResponse = z.infer<typeof documentSearchResultsResponseSchema>;

export const documentUploadResponseSchema = z.object({
  status: documentUploadStatusSchema,
  id: uuidSchema,
});
export type DocumentUploadResponse = z.infer<typeof documentUploadResponseSchema>;
