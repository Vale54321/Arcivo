import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { StorageService } from 'src/storage/storage.service';
import { DocumentRepository } from 'src/repositories/document.repository';
import { ThumbnailJobData } from '../interfaces/job-data.interface';
import { StorageBucket } from 'src/storage/storage.interface';
import { Poppler } from 'node-poppler';
import { QUEUES } from '../job.constants';

@Processor(QUEUES.TEXT_EXTRACTION)
export class TextExtractionProcessor extends WorkerHost {
    private readonly logger = new Logger(TextExtractionProcessor.name);
    private readonly poppler = new Poppler();
    constructor(
        private readonly documentRepository: DocumentRepository,
        private readonly storageService: StorageService,
    ) {
        super();
    }

    async process(job: Job<ThumbnailJobData>): Promise<void> {
        const { documentId } = job.data;
        this.logger.log(`Processing thumbnail job ${job.id}: ${documentId}`);
        try {
            const { documentId } = job.data;

            const doc = await this.documentRepository.findById(documentId);
            if (!doc) throw new Error(`Document ${documentId} not found`);

            const archiveFile = await this.storageService.resolveFilePath(documentId, '.pdf', StorageBucket.ARCHIVE);
            const pngThumbnail = await this.storageService.resolveFilePath(documentId, '', StorageBucket.THUMBS, true);
            const webpThumbnail = await this.storageService.resolveFilePath(documentId, '.webp', StorageBucket.THUMBS, true);

            const options = {
                maintainLayout: true,
                quiet: true,
            };

            const result = await this.poppler.pdfToText(archiveFile, undefined, options);
            const pages = result.split('\x0c').filter((page) => page.trim().length > 0);
            const fullText = pages
                .map((page, i) => `[PAGE ${i + 1}]\n${page.trimEnd()}`)
                .join('\n\n');

            await this.documentRepository.update(documentId, { textContent: fullText });
            this.logger.log(`Text extracted for document ${documentId}: ${fullText.length} characters`);
        } catch (error) {
            this.logger.error(`Failed to extract text for document ${documentId}: ${error.message}`, error.stack);
            throw error;
        }
    }
}
