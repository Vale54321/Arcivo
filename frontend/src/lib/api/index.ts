export { ApiError, ArcivoApi, createApiClient } from './client';
export type { ApiClientOptions, FetchLike } from './client';
export type {
	Document,
	DocumentDetails,
	MatchType,
	SearchResult,
	SerializedBuffer,
	UploadDocumentOptions,
	UploadResult,
	UploadStatus
} from './types';

import { createApiClient } from './client';

/**
 * Browser-ready client. In a SvelteKit load function, prefer:
 * `createApiClient({ fetch })`.
 */
export const api = createApiClient();
