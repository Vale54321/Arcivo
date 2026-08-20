import type {
	AccessTokenResponse,
	CreateUserRequest,
	DocumentMatchType,
	DocumentResponse,
	DocumentSearchResultResponse,
	DocumentSummaryResponse,
	DocumentUploadResponse,
	DocumentUploadStatus,
	ResetUserPasswordRequest,
	SerializedBuffer,
	UpdateUserRequest,
	UserResponse
} from '@arcivo/api-contracts';

// Compatibility names for UI code; serialized shapes come from the contract package.
export type Document = DocumentSummaryResponse;
export type DocumentDetails = DocumentResponse;
export type SearchResult = DocumentSearchResultResponse;
export type UploadResult = DocumentUploadResponse;
export type UploadStatus = DocumentUploadStatus;
export type MatchType = DocumentMatchType;
export type User = UserResponse;
export type CreateUserInput = CreateUserRequest;
export type UpdateUserInput = UpdateUserRequest;
export type ResetUserPasswordInput = ResetUserPasswordRequest;
export type { AccessTokenResponse, SerializedBuffer };

/** Browser transport options; these are not serialized as an API JSON payload. */
export interface UploadDocumentOptions {
	checksum: string;
	fileCreatedAt?: string;
	onProgress?: (percent: number) => void;
	signal?: AbortSignal;
}
