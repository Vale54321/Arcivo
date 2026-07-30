export const APP_EVENTS = {
  DOCUMENT_THUMBNAIL_GENERATED: 'document.thumbnail.generated',
  DOCUMENT_THUMBNAIL_FAILED: 'document.thumbnail.failed',
} as const;

export interface AppEventPayloads {
  [APP_EVENTS.DOCUMENT_THUMBNAIL_GENERATED]: {
    documentId: string;
  };
  [APP_EVENTS.DOCUMENT_THUMBNAIL_FAILED]: {
    documentId: string;
  };
}

export type AppEventName = keyof AppEventPayloads;

export interface AppEvent<TName extends AppEventName = AppEventName> {
  id: string;
  type: TName;
  occurredAt: string;
  data: AppEventPayloads[TName];
}

export type AnyAppEvent = {
  [TName in AppEventName]: AppEvent<TName>;
}[AppEventName];
