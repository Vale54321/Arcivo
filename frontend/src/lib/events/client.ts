import { writable, type Readable } from 'svelte/store';
import type { AppEvent, AppEventName, AppEventPayloads } from './types';

export type EventConnectionStatus = 'idle' | 'connecting' | 'open' | 'reconnecting' | 'closed';
export type EventHandler<TName extends AppEventName> = (
	data: AppEventPayloads[TName],
	event: AppEvent<TName>
) => void;
export type AnyEventHandler = (event: AppEvent) => void;

export class EventStreamClient {
	private controller: AbortController | null = null;
	private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
	private reconnectAttempts = 0;
	private readonly handlers = new Map<AppEventName, Set<EventHandler<AppEventName>>>();
	private readonly anyHandlers = new Set<AnyEventHandler>();
	private readonly statusStore = writable<EventConnectionStatus>('idle');

	readonly status: Readable<EventConnectionStatus> = {
		subscribe: this.statusStore.subscribe
	};

	constructor(
		private readonly url: string,
		private readonly accessToken: () => string | null
	) {}

	connect(): void {
		if (this.controller || this.reconnectTimer) return;
		void this.open(false);
	}

	disconnect(): void {
		if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
		this.reconnectTimer = null;
		this.controller?.abort();
		this.controller = null;
		this.reconnectAttempts = 0;
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

	private async open(reconnecting: boolean): Promise<void> {
		const token = this.accessToken();
		if (!token) {
			this.statusStore.set('closed');
			return;
		}

		this.statusStore.set(reconnecting ? 'reconnecting' : 'connecting');
		const controller = new AbortController();
		this.controller = controller;
		let shouldReconnect = true;

		try {
			const response = await fetch(this.url, {
				headers: {
					Accept: 'text/event-stream',
					Authorization: `Bearer ${token}`
				},
				signal: controller.signal
			});
			if (response.status === 401 || response.status === 403) {
				shouldReconnect = false;
				this.statusStore.set('closed');
			}
			if (!response.ok || !response.body) {
				throw new Error(`SSE connection failed with status ${response.status}`);
			}

			this.reconnectAttempts = 0;
			this.statusStore.set('open');
			await this.read(response.body, controller.signal);
		} catch (error) {
			if (!controller.signal.aborted) {
				console.warn('SSE connection failed', error);
			}
		} finally {
			if (this.controller === controller) {
				this.controller = null;
				if (!controller.signal.aborted && shouldReconnect) this.scheduleReconnect();
			}
		}
	}

	private async read(stream: ReadableStream<Uint8Array>, signal: AbortSignal): Promise<void> {
		const reader = stream.getReader();
		const decoder = new TextDecoder();
		let buffer = '';

		try {
			while (!signal.aborted) {
				const { done, value } = await reader.read();
				if (done) return;
				buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n');

				let boundary = buffer.indexOf('\n\n');
				while (boundary !== -1) {
					this.dispatchFrame(buffer.slice(0, boundary));
					buffer = buffer.slice(boundary + 2);
					boundary = buffer.indexOf('\n\n');
				}
			}
		} finally {
			reader.releaseLock();
		}
	}

	private scheduleReconnect(): void {
		this.reconnectAttempts += 1;
		const delay = Math.min(1_000 * 2 ** (this.reconnectAttempts - 1), 10_000);
		this.statusStore.set('reconnecting');
		this.reconnectTimer = setTimeout(() => {
			this.reconnectTimer = null;
			void this.open(true);
		}, delay);
	}

	private dispatchFrame(frame: string): void {
		const eventType = frame
			.split('\n')
			.find((line) => line.startsWith('event:'))
			?.slice('event:'.length)
			.trim();
		if (eventType === 'heartbeat') return;

		const data = frame
			.split('\n')
			.filter((line) => line.startsWith('data:'))
			.map((line) => line.slice('data:'.length).trimStart())
			.join('\n');
		if (data) this.dispatch(data);
	}

	private dispatch(data: string): void {
		let event: AppEvent;

		try {
			event = JSON.parse(data) as AppEvent;
		} catch {
			console.warn('Ignoring malformed SSE event', data);
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
