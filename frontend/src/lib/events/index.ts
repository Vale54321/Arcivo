import { api } from '$lib/api';
import { EventStreamClient } from './client';

export { EventStreamClient } from './client';
export type { AnyEventHandler, EventConnectionStatus, EventHandler } from './client';
export type { AppEvent, AppEventName, AppEventPayloads } from './types';

export const events = new EventStreamClient(api.eventStreamUrl());
