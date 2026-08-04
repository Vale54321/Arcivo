import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { unlink } from 'node:fs/promises';
import { access } from 'node:fs/promises';
import { constants } from 'node:fs';
import 'multer';
import { BaseService } from 'logging/base.service';
import { LoggingService } from 'logging/logging.service';
import { DocumentUploadDto, UpdateDocumentDto } from './dto/document.dto';
import { FileHashService } from './services/file-hash.service';
import { getMimeType } from './utils/file-type';
import { DocumentRepository } from './document.repository';
import { StorageService } from 'storage/storage.service';
import { StorageBucket } from 'storage/storage.interface';
import { basename, extname } from 'node:path';
import {
  DocumentResponseDto,
  DocumentStatus,
} from './dto/document.response.dto';
import { JobService } from 'jobs/job.service';

@Injectable()
export class DocumentService extends BaseService {
  constructor(
    private documentRepository: DocumentRepository,
    private jobService: JobService,
    private storageService: StorageService,
    loggingService: LoggingService,
    private readonly fileHashService: FileHashService,
  ) {
    super(loggingService);
  }
  async uploadDocument(
    ownerId: string,
    dto: DocumentUploadDto,
    file: Express.Multer.File,
    filename: string,
  ): Promise<DocumentResponseDto> {
    this.logger.log(`Processing document: ${filename}`);

    const mimeType = getMimeType(filename);
    const extension = extname(filename).toLowerCase();

    const checksum = await this.fileHashService.getSha1(file.path);
    const fileDate = dto.fileCreatedAt
      ? new Date(dto.fileCreatedAt)
      : new Date();

    this.logger.debug(`Temp name: ${file.path}`);
    this.logger.debug(`File name: ${filename}`);
    this.logger.debug(`File MIME type: ${mimeType}`);
    this.logger.debug(`File extension: ${extension}`);
    this.logger.debug(`File size: ${file.size} bytes`);
    this.logger.debug(`File checksum: ${checksum}`);
    this.logger.debug(`File created at: ${fileDate.toISOString()}`);

    const duplicate = await this.documentRepository.findByChecksum(
      ownerId,
      checksum,
    );
    if (duplicate) {
      this.logger.log(
        `Duplicate checksum hit for ${filename}: ${duplicate.id}`,
      );
      await this.deleteTempFile(file.path);
      return { status: DocumentStatus.DUPLICATE, id: duplicate.id };
    }

    try {
      const documentEntry = await this.documentRepository.create({
        checksum: checksum,
        name: filename,
        extension: extension,
        size: file.size,
        mimeType: mimeType,
        ownerId,
        fileCreatedAt: fileDate,
      });

      const id = documentEntry.id;
      this.logger.debug(`Created document in DB: ${id}`);

      const finalPath = await this.storageService.moveFileToBucket(
        file.path,
        id,
        extension,
        StorageBucket.UPLOAD,
      );

      this.logger.log(`Document ${id} uploaded and stored at ${finalPath}`);

      await this.jobService.addPdfConversionJob(id);

      return { status: DocumentStatus.CREATED, id: id };
    } catch (error) {
      await this.deleteTempFile(file.path);

      if (error instanceof Error) {
        this.logger.error(
          `Failed to process ${filename}: ${error.message}`,
          error.stack,
        );
      } else {
        this.logger.error(`Failed to process ${filename}: ${String(error)}`);
      }
      throw error;
    }
  }

  async getDocumentByChecksum(
    ownerId: string,
    checksum: string,
  ): Promise<{ id: string } | null> {
    return await this.documentRepository.findByChecksum(ownerId, checksum);
  }

  async getDocumentById(ownerId: string, id: string) {
    const doc = await this.documentRepository.findByIdForOwner(id, ownerId);
    if (!doc) throw new NotFoundException(`Document ${id} not found`);
    return doc;
  }

  async getDocumentThumbnailPath(ownerId: string, id: string): Promise<string> {
    const doc = await this.documentRepository.findByIdForOwner(id, ownerId);
    if (!doc) throw new NotFoundException(`Document ${id} not found`);
    if (!doc.hasThumbnail) {
      throw new NotFoundException(`Thumbnail for document ${id} not found`);
    }

    const thumbnailPath = await this.storageService.resolveFilePath(
      id,
      '.webp',
      StorageBucket.THUMBS,
    );

    await this.ensureFileExists(
      thumbnailPath,
      `Thumbnail for document ${id} not found`,
    );

    return thumbnailPath;
  }

  async getDocumentFile(
    ownerId: string,
    id: string,
  ): Promise<{ path: string; mimeType: string; name: string }> {
    const doc = await this.documentRepository.findByIdForOwner(id, ownerId);
    if (!doc) throw new NotFoundException(`Document ${id} not found`);

    const filePath = await this.storageService.resolveFilePath(
      id,
      doc.extension,
      StorageBucket.UPLOAD,
    );
    await this.ensureFileExists(filePath, `File for document ${id} not found`);

    return {
      path: filePath,
      mimeType: doc.mimeType,
      name: doc.name,
    };
  }

  async getDocumentArchive(
    ownerId: string,
    id: string,
  ): Promise<{ path: string; name: string }> {
    const doc = await this.documentRepository.findByIdForOwner(id, ownerId);
    if (!doc) throw new NotFoundException(`Document ${id} not found`);

    const archivePath = await this.storageService.resolveFilePath(
      id,
      '.pdf',
      StorageBucket.ARCHIVE,
    );
    await this.ensureFileExists(
      archivePath,
      `Archive for document ${id} not found`,
    );

    return {
      path: archivePath,
      name: `${basename(doc.name, doc.extension)}.pdf`,
    };
  }

  async getAllDocuments(ownerId: string) {
    this.logger.log('Fetching all documents');
    return await this.documentRepository.findAll(ownerId);
  }

  async deleteDocument(ownerId: string, id: string): Promise<void> {
    const doc = await this.documentRepository.findByIdForOwner(id, ownerId);
    if (!doc) throw new NotFoundException('Document not found');

    const deleted = await this.documentRepository.deleteForOwner(id, ownerId);
    if (!deleted) throw new NotFoundException('Document not found');

    await this.storageService.deleteFromBucket(
      id,
      doc.extension,
      StorageBucket.UPLOAD,
    );
    await this.storageService.deleteFromBucket(
      id,
      '.webp',
      StorageBucket.THUMBS,
    );
    await this.storageService.deleteFromBucket(
      id,
      '.pdf',
      StorageBucket.ARCHIVE,
    );

    this.logger.log(`Deleted document ${id} and associated files`);
  }

  async updateDocument(ownerId: string, id: string, dto: UpdateDocumentDto) {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('At least one document field is required');
    }

    const { fileCreatedAt, ...metadata } = dto;
    const document = await this.documentRepository.updateForOwner(id, ownerId, {
      ...metadata,
      ...(metadata.name && { name: metadata.name.trim() }),
      ...(fileCreatedAt && { fileCreatedAt: new Date(fileCreatedAt) }),
    });
    if (!document) {
      throw new NotFoundException(`Document ${id} not found`);
    }
    return document;
  }

  private async deleteTempFile(filePath: string): Promise<void> {
    try {
      await unlink(filePath);
      this.logger.debug(`Deleted temp upload: ${filePath}`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        this.logger.warn(`Failed to delete temp upload: ${filePath}`);
      }
    }
  }

  async searchDocuments(ownerId: string, query: string) {
    const term = query.trim();
    this.logger.log(`Searching documents for: "${query}"`);

    const docs = await this.documentRepository.search(ownerId, query);

    if (!docs || docs.length === 0) {
      throw new NotFoundException(`No documents found for: "${term}"`);
    }

    const normalizedTerm = term.toLowerCase();

    return docs.map((doc) => {
      const isNameMatch = doc.name.toLowerCase().includes(normalizedTerm);
      const isContentMatch =
        doc.textContent?.toLowerCase().includes(normalizedTerm) ?? false;

      let matchType: 'filename' | 'content' | 'both' = 'content';
      if (isNameMatch && isContentMatch) matchType = 'both';
      else if (isNameMatch) matchType = 'filename';

      return {
        id: doc.id,
        name: doc.name,
        size: doc.size,
        mimeType: doc.mimeType,
        fileCreatedAt: doc.fileCreatedAt,
        createdAt: doc.createdAt,
        hasThumbnail: doc.hasThumbnail,
        matchType,
      };
    });
  }

  private async ensureFileExists(
    filePath: string,
    message: string,
  ): Promise<void> {
    try {
      await access(filePath, constants.F_OK);
    } catch {
      throw new NotFoundException(message);
    }
  }
}
