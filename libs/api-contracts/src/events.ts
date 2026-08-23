import { z } from 'zod';
import { isoDateTimeSchema, uuidSchema } from './common';

export const APP_EVENTS = {
  DOCUMENT_THUMBNAIL_GENERATED: 'document.thumbnail.generated',
  DOCUMENT_THUMBNAIL_FAILED: 'document.thumbnail.failed',
} as const;

const documentEventPayloadSchema = z.object({ documentId: uuidSchema });

export const documentThumbnailGeneratedEventSchema = z.object({
  id: uuidSchema,
  type: z.literal(APP_EVENTS.DOCUMENT_THUMBNAIL_GENERATED),
  occurredAt: isoDateTimeSchema,
  data: documentEventPayloadSchema,
});
export const documentThumbnailFailedEventSchema = z.object({
  id: uuidSchema,
  type: z.literal(APP_EVENTS.DOCUMENT_THUMBNAIL_FAILED),
  occurredAt: isoDateTimeSchema,
  data: documentEventPayloadSchema,
});

export const appEventSchema = z.discriminatedUnion('type', [
  documentThumbnailGeneratedEventSchema,
  documentThumbnailFailedEventSchema,
]);
export type AppEvent = z.infer<typeof appEventSchema>;
export type AppEventName = AppEvent['type'];
export type AppEventPayloads = {
  [APP_EVENTS.DOCUMENT_THUMBNAIL_GENERATED]: z.infer<typeof documentEventPayloadSchema>;
  [APP_EVENTS.DOCUMENT_THUMBNAIL_FAILED]: z.infer<typeof documentEventPayloadSchema>;
};
export type EventFor<TName extends AppEventName> = Extract<AppEvent, { type: TName }>;
