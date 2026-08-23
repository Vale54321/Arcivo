import { describe, expect, it } from 'vitest';
import { ArcivoApi } from './client';

const validUser = {
	id: '11111111-1111-4111-8111-111111111111',
	email: 'ada@example.com',
	displayName: 'Ada Lovelace',
	isAdmin: false,
	createdAt: '2026-08-01T00:00:00.000Z',
	updatedAt: '2026-08-02T00:00:00.000Z'
};

function jsonResponse(body: unknown): Response {
	return new Response(JSON.stringify(body), {
		status: 200,
		headers: { 'content-type': 'application/json' }
	});
}

describe(ArcivoApi.name, () => {
	it('parses a representative contract response', async () => {
		const client = new ArcivoApi({
			baseUrl: 'https://example.test',
			fetch: async () => jsonResponse(validUser),
			accessToken: () => null
		});

		await expect(client.getCurrentUser()).resolves.toEqual(validUser);
	});

	it('rejects malformed JSON responses at the network boundary', async () => {
		const client = new ArcivoApi({
			baseUrl: 'https://example.test',
			fetch: async () => jsonResponse({ ...validUser, createdAt: 'not-a-date' }),
			accessToken: () => null
		});

		await expect(client.getCurrentUser()).rejects.toThrow();
	});
});
