export { ApiError, ArcivoApi, createApiClient } from './client';
export type { ApiClientOptions, FetchLike } from './client';
export type {
	Document,
	AccessTokenResponse,
	CreateUserInput,
	DocumentDetails,
	MatchType,
	SearchResult,
	SerializedBuffer,
	UploadDocumentOptions,
	UploadResult,
	UploadStatus,
	User,
	UpdateUserInput,
	ResetUserPasswordInput
} from './types';

import { createApiClient } from './client';

/**
 * Browser-ready client. In a SvelteKit load function, prefer:
 * `createApiClient({ fetch })`.
 */
export const api = createApiClient();
