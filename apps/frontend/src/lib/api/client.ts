import { PUBLIC_API_BASE_URL } from '$env/static/public';
import { clearAccessToken, getAccessToken } from '$lib/auth';
import {
	accessTokenResponseSchema,
	apiErrorResponseSchema,
	documentResponseSchema,
	documentSearchResultsResponseSchema,
	documentsResponseSchema,
	documentUploadResponseSchema,
	userResponseSchema,
	usersResponseSchema
} from '@arcivo/api-contracts';
import type {
	AccessTokenResponse,
	CreateUserInput,
	Document,
	DocumentDetails,
	SearchResult,
	ResetUserPasswordInput,
	UpdateUserInput,
	UploadDocumentOptions,
	UploadResult,
	User
} from './types';

export type FetchLike = typeof globalThis.fetch;

export interface ApiClientOptions {
	baseUrl?: string;
	fetch?: FetchLike;
	accessToken?: () => string | null;
}

interface ResponseSchema<T> {
	parse(value: unknown): T;
}

const API_PATHS = {
	documents: '/v1/document',
	login: '/v1/auth/login',
	developmentLogin: '/v1/auth/development-login',
	users: '/v1/users',
	events: '/v1/events'
} as const;

export class ApiError extends Error {
	readonly status: number;
	readonly payload?: unknown;

	constructor(status: number, message: string, payload?: unknown) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
		this.payload = payload;
	}
}

export class ArcivoApi {
	private readonly baseUrl: string;
	private readonly fetcher: FetchLike;
	private readonly accessToken: () => string | null;

	constructor({
		baseUrl = PUBLIC_API_BASE_URL || '/api',
		fetch = globalThis.fetch,
		accessToken = getAccessToken
	}: ApiClientOptions = {}) {
		this.baseUrl = baseUrl.replace(/\/+$/, '');
		this.fetcher = fetch;
		this.accessToken = accessToken;
	}

	login(email: string, password: string): Promise<AccessTokenResponse> {
		return this.request(accessTokenResponseSchema, API_PATHS.login, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, password })
		});
	}

	developmentLogin(): Promise<AccessTokenResponse> {
		return this.request(accessTokenResponseSchema, API_PATHS.developmentLogin, { method: 'POST' });
	}

	getCurrentUser(): Promise<User> {
		return this.request(userResponseSchema, `${API_PATHS.users}/me`);
	}

	getUsers(): Promise<User[]> {
		return this.request(usersResponseSchema, API_PATHS.users);
	}

	createUser(input: CreateUserInput): Promise<User> {
		return this.request(userResponseSchema, API_PATHS.users, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input)
		});
	}

	updateUser(id: string, input: UpdateUserInput): Promise<User> {
		return this.request(userResponseSchema, `${API_PATHS.users}/${encodeURIComponent(id)}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input)
		});
	}

	resetUserPassword(id: string, input: ResetUserPasswordInput): Promise<void> {
		return this.requestNoContent(`${API_PATHS.users}/${encodeURIComponent(id)}/password`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(input)
		});
	}

	getDocuments(): Promise<Document[]> {
		return this.request(documentsResponseSchema, API_PATHS.documents);
	}

	getDocument(id: string): Promise<DocumentDetails> {
		return this.request(documentResponseSchema, `${API_PATHS.documents}/${encodeURIComponent(id)}`);
	}

	searchDocuments(query: string): Promise<SearchResult[]> {
		const search = new URLSearchParams({ q: query });
		return this.request(
			documentSearchResultsResponseSchema,
			`${API_PATHS.documents}/search?${search}`
		);
	}

	deleteDocument(id: string): Promise<void> {
		return this.requestNoContent(`${API_PATHS.documents}/${encodeURIComponent(id)}`, {
			method: 'DELETE'
		});
	}

	getThumbnail(id: string, signal?: AbortSignal): Promise<Blob> {
		return this.requestBlob(`${API_PATHS.documents}/${encodeURIComponent(id)}/thumbnail`, {
			signal
		});
	}

	downloadOriginal(id: string): Promise<Blob> {
		return this.requestBlob(`${API_PATHS.documents}/${encodeURIComponent(id)}/file`);
	}

	downloadArchive(id: string): Promise<Blob> {
		return this.requestBlob(`${API_PATHS.documents}/${encodeURIComponent(id)}/archive`);
	}

	uploadDocument(file: File, options: UploadDocumentOptions): Promise<UploadResult> {
		const formData = new FormData();
		formData.append('documentData', file);
		formData.append(
			'fileCreatedAt',
			options.fileCreatedAt ?? new Date(file.lastModified).toISOString()
		);

		if (options.onProgress) {
			return this.uploadWithProgress(file, formData, options);
		}

		return this.request(documentUploadResponseSchema, API_PATHS.documents, {
			method: 'POST',
			headers: this.uploadHeaders(file, options.checksum),
			body: formData,
			signal: options.signal
		});
	}

	thumbnailUrl(id: string): string {
		return this.url(`${API_PATHS.documents}/${encodeURIComponent(id)}/thumbnail`);
	}

	archiveUrl(id: string): string {
		return this.url(`${API_PATHS.documents}/${encodeURIComponent(id)}/archive`);
	}

	downloadUrl(id: string): string {
		return this.url(`${API_PATHS.documents}/${encodeURIComponent(id)}/file`);
	}

	eventStreamUrl(): string {
		return this.url(API_PATHS.events);
	}

	private async request<T>(
		schema: ResponseSchema<T>,
		path: string,
		init: RequestInit = {}
	): Promise<T> {
		const headers = new Headers(init.headers);
		headers.set('Accept', 'application/json');
		this.applyAuthorization(headers);

		const response = await this.fetcher(this.url(path), { ...init, headers });

		if (!response.ok) {
			if (response.status === 401) clearAccessToken();
			throw await this.toApiError(response);
		}

		return schema.parse(await response.json());
	}

	private async requestNoContent(path: string, init: RequestInit = {}): Promise<void> {
		const headers = new Headers(init.headers);
		headers.set('Accept', 'application/json');
		this.applyAuthorization(headers);
		const response = await this.fetcher(this.url(path), { ...init, headers });
		if (!response.ok) {
			if (response.status === 401) clearAccessToken();
			throw await this.toApiError(response);
		}
		if (response.status !== 204) {
			throw new ApiError(response.status, 'Expected an empty response');
		}
	}

	private async requestBlob(path: string, init: RequestInit = {}): Promise<Blob> {
		const headers = new Headers(init.headers);
		headers.set('Accept', '*/*');
		this.applyAuthorization(headers);

		const response = await this.fetcher(this.url(path), { ...init, headers });
		if (!response.ok) {
			if (response.status === 401) clearAccessToken();
			throw await this.toApiError(response);
		}
		return await response.blob();
	}

	private uploadWithProgress(
		file: File,
		body: FormData,
		options: UploadDocumentOptions
	): Promise<UploadResult> {
		if (typeof XMLHttpRequest === 'undefined') {
			return Promise.reject(new Error('Upload progress is only available in the browser'));
		}

		return new Promise<UploadResult>((resolve, reject) => {
			const request = new XMLHttpRequest();
			request.open('POST', this.url(API_PATHS.documents));

			for (const [name, value] of Object.entries(this.uploadHeaders(file, options.checksum))) {
				request.setRequestHeader(name, value);
			}
			const accessToken = this.accessToken();
			if (accessToken) request.setRequestHeader('Authorization', `Bearer ${accessToken}`);

			request.upload.addEventListener('progress', (event) => {
				if (event.lengthComputable) {
					options.onProgress?.(Math.round((event.loaded / event.total) * 100));
				}
			});

			request.addEventListener('load', () => {
				const payload = this.parseTextPayload(request.responseText);

				if (request.status >= 200 && request.status < 300) {
					resolve(documentUploadResponseSchema.parse(payload));
					return;
				}

				if (request.status === 401) clearAccessToken();
				reject(this.apiErrorFromPayload(request.status, request.statusText, payload));
			});
			request.addEventListener('error', () => reject(new Error('Network request failed')));
			request.addEventListener('abort', () =>
				reject(new DOMException('The upload was aborted', 'AbortError'))
			);

			if (options.signal) {
				if (options.signal.aborted) {
					request.abort();
					return;
				}
				options.signal.addEventListener('abort', () => request.abort(), { once: true });
			}

			request.send(body);
		});
	}

	private uploadHeaders(file: File, checksum: string): Record<string, string> {
		return {
			'x-arcivo-checksum': checksum,
			'x-arcivo-filename': encodeURIComponent(file.name)
		};
	}

	private applyAuthorization(headers: Headers): void {
		const accessToken = this.accessToken();
		if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
	}

	private url(path: string): string {
		return `${this.baseUrl}/${path.replace(/^\/+/, '')}`;
	}

	private async toApiError(response: Response): Promise<ApiError> {
		const contentType = response.headers.get('content-type') ?? '';
		const payload = contentType.includes('application/json')
			? await response.json().catch(() => undefined)
			: await response.text().catch(() => undefined);

		return this.apiErrorFromPayload(response.status, response.statusText, payload);
	}

	private apiErrorFromPayload(status: number, statusText: string, payload: unknown): ApiError {
		const parsedPayload = apiErrorResponseSchema.safeParse(payload);
		const apiPayload = parsedPayload.success ? parsedPayload.data : undefined;
		const message = Array.isArray(apiPayload?.message)
			? apiPayload.message.join(', ')
			: (apiPayload?.message ?? apiPayload?.error ?? statusText ?? 'Request failed');

		return new ApiError(status, message, payload);
	}

	private parseTextPayload(value: string): unknown {
		if (!value) return undefined;

		try {
			return JSON.parse(value);
		} catch {
			return value;
		}
	}
}

export function createApiClient(options?: ApiClientOptions): ArcivoApi {
	return new ArcivoApi(options);
}
