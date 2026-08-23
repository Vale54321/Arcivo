import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { dirname, join, resolve } from 'node:path';
import { mkdir, copyFile, unlink, writeFile } from 'node:fs/promises';
import { IStorageService, StorageBucket } from './storage.interface';

@Injectable()
export class StorageService implements IStorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly libraryRoot: string;

  constructor(private readonly configService: ConfigService) {
    this.libraryRoot = resolve(
      this.configService.getOrThrow<string>('STORAGE_ROOT'),
    );
  }

  getShardPath(id: string): string {
    const shard1 = id.substring(0, 2);
    const shard2 = id.substring(2, 4);
    return join(shard1, shard2);
  }

  async moveFileToBucket(
    tempPath: string,
    documentId: string,
    extension: string,
    bucket: StorageBucket,
  ): Promise<string> {
    const finalPath = await this.resolveFilePath(documentId, extension, bucket);
    const finalDir = dirname(finalPath);

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

  async writeBufferToBucket(
    buffer: Buffer,
    documentId: string,
    extension: string,
    bucket: StorageBucket,
  ): Promise<string> {
    const finalPath = await this.resolveFilePath(documentId, extension, bucket);
    const finalDir = dirname(finalPath);

    try {
      await mkdir(finalDir, { recursive: true });
      await writeFile(finalPath, buffer);

      this.logger.debug(`Buffer stored successfully: ${finalPath}`);
      return finalPath;
    } catch (error) {
      this.logger.error(`Failed to write buffer for ${documentId}`, error);
      throw error;
    }
  }

  async resolveFilePath(
    documentId: string,
    extension: string,
    bucket: StorageBucket,
    createDirectory = false,
  ): Promise<string> {
    const shard = this.getShardPath(documentId);
    const filePath = join(
      this.libraryRoot,
      bucket,
      shard,
      `${documentId}${extension}`,
    );

    if (createDirectory) {
      await mkdir(dirname(filePath), { recursive: true });
    }

    return filePath;
  }

  async deleteFromBucket(
    documentId: string,
    extension: string,
    bucket: StorageBucket,
  ): Promise<void> {
    const fullPath = await this.resolveFilePath(documentId, extension, bucket);

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
