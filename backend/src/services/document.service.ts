import { Injectable } from "@nestjs/common";
import { BaseService } from "./base.service";
import { copyFile, mkdir, unlink } from 'node:fs/promises';
import { join, extname } from "node:path";
import { LoggingRepository } from "src/repositories/logging.repository";
import { DocumentUploadDto } from "src/dtos/document.dto";
import { FileHashService } from "src/services/hash.service";

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

        try {
            const checksum = await this.fileHashService.getSha1(file.path);
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
