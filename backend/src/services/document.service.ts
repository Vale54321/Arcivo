import { Injectable } from "@nestjs/common";
import { BaseService } from "./base.service";
import { copyFile, mkdir, unlink } from 'node:fs/promises';
import { join, extname } from "node:path";
import { LoggingRepository } from "src/repositories/logging.repository";
import { DocumentUploadDto } from "src/dtos/document.dto";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";

@Injectable()
export class DocumentService extends BaseService {
    constructor(
        loggingRepository: LoggingRepository,
    ) {
        super(loggingRepository);
    }
    private readonly uploadDir = 'library/upload';

    private async calculateChecksum(filePath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const hash = createHash('sha1');
            const stream = createReadStream(filePath);
            stream.on('data', (data) => hash.update(data));
            stream.on('end', () => resolve(hash.digest('hex')));
            stream.on('error', (err) => reject(err));
        });
    }

    async uploadDocument(
        dto: DocumentUploadDto,
        file: Express.Multer.File,
    ): Promise<String> {
        this.logger.log(`Processing document: ${file.originalname}`);

        try {
            const checksum = await this.calculateChecksum(file.path);

            const fileExt = extname(file.originalname);
            const fileName = `${checksum}${fileExt}`;

            const finalPath = join(this.uploadDir, fileName);

            await mkdir(this.uploadDir, { recursive: true });
            await copyFile(file.path, finalPath);
            await unlink(file.path);

            return fileName;
        } catch (error) {
            this.logger.error(`Failed to process ${file.originalname}:`, error);
            throw error;
        }
    }
}
