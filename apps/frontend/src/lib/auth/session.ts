import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const ACCESS_TOKEN_KEY = 'arcivo:access-token';
const RECENT_DOCUMENTS_KEY = 'arcivo:recent';

function readAccessToken(): string | null {
	if (!browser) return null;
	return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export const accessToken = writable<string | null>(readAccessToken());

export function getAccessToken(): string | null {
	return readAccessToken();
}

export function setAccessToken(token: string): void {
	if (browser) localStorage.setItem(ACCESS_TOKEN_KEY, token);
	accessToken.set(token);
}

export function clearAccessToken(): void {
	if (browser) {
		localStorage.removeItem(ACCESS_TOKEN_KEY);
		localStorage.removeItem(RECENT_DOCUMENTS_KEY);
	}
	accessToken.set(null);
}
