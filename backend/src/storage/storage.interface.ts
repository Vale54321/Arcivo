export enum StorageBucket {
  ARCHIVE = 'archive',
  UPLOAD = 'upload'
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
    bucket: StorageBucket
  ): Promise<string>;

  /**
   * Deletes a file from the specified storage bucket.
   */
  deleteFromBucket(documentId: string, extension: string, bucket: StorageBucket): Promise<void>;

  /**
   * Generates the sharded directory path based on an ID.
   */
  getShardPath(id: string): string;
}