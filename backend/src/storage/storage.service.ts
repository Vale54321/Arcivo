import { Injectable, Logger } from '@nestjs/common';
import { join } from 'node:path';
import { mkdir, copyFile, unlink } from 'node:fs/promises';
import { IStorageService, StorageBucket } from './storage.interface';

@Injectable()
export class StorageService implements IStorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly libraryRoot = join(process.cwd(), 'library');

  getShardPath(id: string): string {
    const shard1 = id.substring(0, 2);
    const shard2 = id.substring(2, 4);
    return join(shard1, shard2);
  }

  async moveFileToBucket(
        tempPath: string, 
        documentId: string, 
        extension: string,
        bucket: StorageBucket
    ): Promise<string> {
    const shard = this.getShardPath(documentId);
    const finalDir = join(this.libraryRoot, bucket, shard);
    const finalPath = join(finalDir, `${documentId}${extension}`);

    try {
      await mkdir(finalDir, { recursive: true });
      await copyFile(tempPath, finalPath);
      await unlink(tempPath);
      
      this.logger.debug(`File stored successfully: ${finalPath}`);
      return finalPath;
    } catch (error) {
      this.logger.error(`Failed to save file ${documentId}`, error);
      throw error;
    }
  }

  async deleteFromBucket(documentId: string, extension: string, bucket: StorageBucket): Promise<void> {
    const shard = this.getShardPath(documentId);
    const fileName = `${documentId}${extension}`;
    const fullPath = join(this.libraryRoot, bucket, shard, fileName);
    
    await this.deleteFile(fullPath);
  }

  private async deleteFile(filePath: string): Promise<void> {
    try {
      await unlink(filePath);
    } catch (error) {
      this.logger.warn(`Could not delete file at ${filePath}`, error);
    }
  }
}