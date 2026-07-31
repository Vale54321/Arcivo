import { writable } from 'svelte/store';
import type { Document } from '$lib/api';

export const uploadOpen = writable(false);
export const searchQuery = writable('');

export type DocumentViewerRequest = {
	doc: Document;
	searchQuery?: string;
};

export const documentViewer = writable<DocumentViewerRequest | null>(null);
