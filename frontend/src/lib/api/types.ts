export interface SerializedBuffer {
	type: 'Buffer';
	data: number[];
}

export interface Document {
	id: string;
	name: string;
	mimeType: string;
	size: number;
	fileCreatedAt: string;
	createdAt: string;
	hasThumbnail: boolean;
	extension?: string;
	ownerId?: string;
	textContent?: string | null;
	checksum?: SerializedBuffer;
}

export interface DocumentDetails extends Document {
	extension: string;
	ownerId: string;
	textContent: string | null;
	checksum: SerializedBuffer;
}

export type UploadStatus = 'created' | 'duplicate';

export interface UploadResult {
	status: UploadStatus;
	id: string;
}

export type MatchType = 'filename' | 'content' | 'both';

export interface SearchResult extends Document {
	matchType: MatchType;
}

export interface UploadDocumentOptions {
	checksum: string;
	fileCreatedAt?: string;
	onProgress?: (percent: number) => void;
	signal?: AbortSignal;
}

export interface AccessTokenResponse {
	accessToken: string;
}

export interface User {
	id: string;
	email: string;
	displayName: string;
	isAdmin: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface UpdateUserInput {
	email?: string;
	displayName?: string;
}

export interface CreateUserInput {
	email: string;
	displayName: string;
	password: string;
}

export interface ResetUserPasswordInput {
	password: string;
}
