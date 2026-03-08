import { BadRequestException, Injectable } from "@nestjs/common";
import { BaseService } from "./base.service";
import { LoggingRepository } from "src/repositories/logging.repository";
import { DocumentUploadDto } from "src/dtos/document.dto";
import { FileHashService } from "src/services/hash.service";
import { getMimeType, isSupportedMimeType } from "src/utils/file-type";
import { DocumentRepository } from "src/repositories/document.repository";
import { StorageService } from "src/storage/storage.service";
import { StorageBucket } from "src/storage/storage.interface";
import { extname } from "node:path";

@Injectable()
export class DocumentService extends BaseService {
    constructor(
        private documentRepository: DocumentRepository,
        private storageService: StorageService,
        loggingRepository: LoggingRepository,
        private readonly fileHashService: FileHashService,
    ) {
        super(loggingRepository);
    }
    private readonly dummyOwnerId = '00000000-0000-0000-0000-000000000000';

    async uploadDocument(
        dto: DocumentUploadDto,
        file: Express.Multer.File,
    ): Promise<String> {
        this.logger.log(`Processing document: ${file.originalname}`);
        
        const mimeType = getMimeType(file.originalname);
        const extension = extname(file.originalname).toLowerCase();

        if (!isSupportedMimeType(mimeType)) {
            this.logger.warn(`Rejected unsupported file type: ${file.originalname} (${mimeType})`);
            throw new BadRequestException('Only documents (PDF, Office, Text) are allowed.');
        }

        const checksum = await this.fileHashService.getSha1(file.path);
        const fileDate = dto.fileCreatedAt ? new Date(dto.fileCreatedAt) : new Date();

        this.logger.debug(`File name: ${file.originalname}`);
        this.logger.debug(`File MIME type: ${mimeType}`);
        this.logger.debug(`File extension: ${extension}`);
        this.logger.debug(`File size: ${file.size} bytes`);
        this.logger.debug(`File checksum: ${checksum}`);
        this.logger.debug(`File created at: ${fileDate.toISOString()}`);

        const documentEntry = await this.documentRepository.create({
            checksum: checksum,
            name: file.originalname,
            extension: extension,
            size: file.size,
            mimeType: mimeType,
            ownerId: this.dummyOwnerId,
            fileCreatedAt: fileDate,
        });

        const id = documentEntry.id;
        this.logger.debug(`Created document in DB: ${id}`);

        try {
            const finalPath = await this.storageService.moveFileToBucket(
                file.path, 
                id, 
                extension,
                StorageBucket.UPLOAD
            );

            this.logger.log(`Document ${id} processed and stored at ${finalPath}`);

            return finalPath;
        } catch (error) {
            if (error instanceof Error) {
                this.logger.error(`Failed to process ${file.originalname}: ${error.message}`, error.stack);
            } else {
                this.logger.error(`Failed to process ${file.originalname}: ${String(error)}`);
            }
            throw error;
        }
    }
}
