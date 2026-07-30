import { writable, type Readable } from 'svelte/store';
import type { AppEvent, AppEventName, AppEventPayloads } from './types';

export type EventConnectionStatus = 'idle' | 'connecting' | 'open' | 'reconnecting' | 'closed';
export type EventHandler<TName extends AppEventName> = (
	data: AppEventPayloads[TName],
	event: AppEvent<TName>
) => void;
export type AnyEventHandler = (event: AppEvent) => void;

export class EventStreamClient {
	private source: EventSource | null = null;
	private readonly handlers = new Map<AppEventName, Set<EventHandler<AppEventName>>>();
	private readonly anyHandlers = new Set<AnyEventHandler>();
	private readonly statusStore = writable<EventConnectionStatus>('idle');

	readonly status: Readable<EventConnectionStatus> = {
		subscribe: this.statusStore.subscribe
	};

	constructor(private readonly url: string) {}

	connect(): void {
		if (this.source || typeof EventSource === 'undefined') return;

		this.statusStore.set('connecting');
		const source = new EventSource(this.url);
		this.source = source;

		source.onopen = () => this.statusStore.set('open');
		source.onerror = () => {
			this.statusStore.set(
				source.readyState === EventSource.CONNECTING ? 'reconnecting' : 'closed'
			);
		};
		source.onmessage = (message) => this.dispatch(message);
	}

	disconnect(): void {
		this.source?.close();
		this.source = null;
		this.statusStore.set('closed');
	}

	on<TName extends AppEventName>(type: TName, handler: EventHandler<TName>): () => void {
		const handlers = this.handlers.get(type) ?? new Set<EventHandler<AppEventName>>();
		handlers.add(handler as EventHandler<AppEventName>);
		this.handlers.set(type, handlers);

		return () => {
			handlers.delete(handler as EventHandler<AppEventName>);
			if (handlers.size === 0) this.handlers.delete(type);
		};
	}

	onAny(handler: AnyEventHandler): () => void {
		this.anyHandlers.add(handler);
		return () => this.anyHandlers.delete(handler);
	}

	private dispatch(message: MessageEvent<string>): void {
		let event: AppEvent;

		try {
			event = JSON.parse(message.data) as AppEvent;
		} catch {
			console.warn('Ignoring malformed SSE event', message.data);
			return;
		}

		if (!event || typeof event.type !== 'string' || !('data' in event)) {
			console.warn('Ignoring invalid SSE event', event);
			return;
		}

		const handlers = this.handlers.get(event.type);
		for (const handler of handlers ?? []) {
			try {
				handler(event.data, event);
			} catch (error) {
				console.error(`SSE handler for "${event.type}" failed`, error);
			}
		}

		for (const handler of this.anyHandlers) {
			try {
				handler(event);
			} catch (error) {
				console.error('SSE catch-all handler failed', error);
			}
		}
	}
}
