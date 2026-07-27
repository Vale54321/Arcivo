import axios from 'axios';
import type { AxiosProgressEvent } from 'axios';

const BASE_URL = 'http://10.50.0.70:3069';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Document {
	id: string;
	name: string;
	extension: string;
	mimeType: string;
	size: number;
	ownerId: string;
	fileCreatedAt: string;
	createdAt: string;
	hasThumbnail: boolean;
	textContent: string | null;
	checksum?: { type: 'Buffer'; data: number[] };
}

export interface UploadResult {
	status: 'created' | 'duplicate';
	document: Document;
}

export type MatchType = 'filename' | 'content' | 'both';

export interface SearchResult extends Document {
	matchType: MatchType;
}

// ─── Error ────────────────────────────────────────────────────────────────────

export class ApiError extends Error {
	constructor(
		public readonly status: number,
		message: string
	) {
		super(message);
		this.name = 'ApiError';
	}
}

// ─── Axios instance ───────────────────────────────────────────────────────────

const client = axios.create({ baseURL: BASE_URL });

// Unwrap axios errors into ApiError
client.interceptors.response.use(
	(res) => res,
	(err) => {
		if (axios.isAxiosError(err) && err.response) {
			const msg = err.response.data?.message ?? err.response.statusText;
			throw new ApiError(err.response.status, msg);
		}
		throw err;
	}
);

// ─── Client ───────────────────────────────────────────────────────────────────

class ArcivoApiClient {
	// ── Documents ─────────────────────────────────────────────────────────────

	/** Fetch all documents */
	async getDocuments(): Promise<Document[]> {
		const { data } = await client.get<Document[]>('/document');
		return data;
	}

	/** Fetch a single document by ID (includes checksum, createdAt, etc.) */
	async getDocument(id: string): Promise<Document> {
		const { data } = await client.get<Document>(`/document/${id}`);
		return data;
	}

	/** Upload a new document with a SHA-1 checksum header and optional progress callback */
	async uploadDocument(
		file: File,
		checksum: string,
		onProgress?: (percent: number) => void
	): Promise<UploadResult> {
		const formData = new FormData();
		formData.append('documentData', file);
		formData.append('fileCreatedAt', new Date(file.lastModified).toISOString());

		const { data } = await client.post<UploadResult>('/document', formData, {
			headers: {
				'x-arcivo-checksum': checksum,
				'x-arcivo-filename': encodeURIComponent(file.name)
			},
			onUploadProgress: (e: AxiosProgressEvent) => {
				if (onProgress && e.total) {
					onProgress(Math.round((e.loaded / e.total) * 100));
				}
			}
		});
		return data;
	}

	/** Search documents by query */
	async searchDocuments(q: string): Promise<SearchResult[]> {
		const { data } = await client.get<SearchResult[]>('/document/search', {
			params: { q }
		});
		return data;
	}

	/** Delete a document by ID */
	async deleteDocument(id: string): Promise<void> {
		await client.delete(`/document/${id}`);
	}

	/** Get the thumbnail URL for a document (not a fetch — just a URL helper) */
	thumbnailUrl(id: string): string {
		return `${BASE_URL}/document/${id}/thumbnail`;
	}

	/** Get the archive/view URL for a document */
	archiveUrl(id: string): string {
		return `${BASE_URL}/document/${id}/archive`;
	}

	/** Get the original file URL for a document */
	downloadUrl(id: string): string {
		return `${BASE_URL}/document/${id}/file`;
	}
}

export const api = new ArcivoApiClient();
