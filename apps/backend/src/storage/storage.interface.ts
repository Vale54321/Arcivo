export enum StorageBucket {
  ARCHIVE = 'archive',
  UPLOAD = 'upload',
  THUMBS = 'thumbs',
}

export interface IStorageService {
  /**
   * Moves a file from a temporary location to the specified storage bucket.
   * @returns The final absolute or relative path to the stored file.
   */
  moveFileToBucket(
    tempPath: string,
    targetId: string,
    extension: string,
    bucket: StorageBucket,
  ): Promise<string>;

  /**
   * Directly writes a buffer to the destination.
   */
  writeBufferToBucket(
    buffer: Buffer,
    documentId: string,
    extension: string,
    bucket: StorageBucket,
  ): Promise<string>;

  /**
   * Deletes a file from the specified storage bucket.
   */
  deleteFromBucket(
    documentId: string,
    extension: string,
    bucket: StorageBucket,
  ): Promise<void>;

  /**
   * Resolves the full storage path for a file in the specified bucket.
   */
  resolveFilePath(
    documentId: string,
    extension: string,
    bucket: StorageBucket,
    createDirectory?: boolean,
  ): Promise<string>;

  /**
   * Generates the sharded directory path based on an ID.
   */
  getShardPath(id: string): string;
}
