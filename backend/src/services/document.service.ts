import { BadRequestException, Injectable } from "@nestjs/common";
import { BaseService } from "./base.service";
import { copyFile, mkdir, unlink } from 'node:fs/promises';
import { join, extname } from "node:path";
import { LoggingRepository } from "src/repositories/logging.repository";
import { DocumentUploadDto } from "src/dtos/document.dto";
import { FileHashService } from "src/services/hash.service";
import { getMimeType, isSupportedMimeType } from "src/utils/file-type";

@Injectable()
export class DocumentService extends BaseService {
    constructor(
        loggingRepository: LoggingRepository,
        private readonly fileHashService: FileHashService,
    ) {
        super(loggingRepository);
    }
    private readonly uploadDir = 'library/upload';

    async uploadDocument(
        dto: DocumentUploadDto,
        file: Express.Multer.File,
    ): Promise<String> {
        this.logger.log(`Processing document: ${file.originalname}`);
        
        const mimeType = getMimeType(file.originalname);

        if (!isSupportedMimeType(mimeType)) {
            this.logger.warn(`Rejected unsupported file type: ${file.originalname} (${mimeType})`);
            throw new BadRequestException('Only documents (PDF, Office, Text) are allowed.');
        }

        const checksum = await this.fileHashService.getSha1(file.path);

        const fileDate = dto.fileCreatedAt ? new Date(dto.fileCreatedAt) : new Date();

        this.logger.debug(`File name: ${file.originalname}`);
        this.logger.debug(`MIME type: ${mimeType}`);
        this.logger.debug(`File size: ${file.size} bytes`);
        this.logger.debug(`File checksum: ${checksum}`);
        this.logger.debug(`File created at: ${fileDate.toISOString()}`);

        try {
            const fileExt = extname(file.originalname);
            const fileName = `${checksum}${fileExt}`;

            const finalPath = join(this.uploadDir, fileName);

            await mkdir(this.uploadDir, { recursive: true });
            await copyFile(file.path, finalPath);
            await unlink(file.path);

            return fileName;
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
