export interface AppEventPayloads {
	'document.thumbnail.generated': {
		documentId: string;
	};
	'document.thumbnail.failed': {
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
