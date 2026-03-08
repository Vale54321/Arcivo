import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { DocumentRepository } from 'src/repositories/document.repository';
import { PdfConversionJobData } from '../interfaces/job-data.interface';
import { LibreOffice, PdfFormat } from 'chromiumly';
import { StorageBucket } from 'src/storage/storage.interface';
import { StorageService } from 'src/storage/storage.service';

@Processor('gotenberg-conversion')
export class GotenbergProcessor extends WorkerHost {
    private readonly logger = new Logger(GotenbergProcessor.name);

    constructor(
        private readonly documentRepository: DocumentRepository,
        private readonly storageService: StorageService,
    ) {
        super();
    }

    async process(job: Job<PdfConversionJobData>): Promise<void> {
        try {
            const { documentId } = job.data;
            this.logger.log(`Converting document ${documentId} to PDF/A`);

            const doc = await this.documentRepository.findById(documentId);
            if (!doc) throw new Error(`Document ${documentId} not found`);

            const originalPath = this.storageService.resolveFilePath(documentId, doc.extension, StorageBucket.UPLOAD);

            const buffer = await LibreOffice.convert({
                files: [originalPath],
                pdfa: PdfFormat.A_2b,
            });

            const archivePath = await this.storageService.writeBufferToBucket(buffer, documentId, '.pdf', StorageBucket.ARCHIVE);
            this.logger.log(`Converted to PDF/A: ${archivePath}`);
        } catch (error) {
            this.logger.error(`Job ${job.id} failed: ${error.message}`, error.stack);
            throw error;
        }
    }
}
