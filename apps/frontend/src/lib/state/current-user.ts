import { writable } from 'svelte/store';
import type { User } from '$lib/api';

export const currentUser = writable<User | null>(null);

export function setCurrentUser(user: User): void {
	currentUser.set(user);
}

export function clearCurrentUser(): void {
	currentUser.set(null);
}
