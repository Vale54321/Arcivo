import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { DocumentRepository } from 'src/repositories/document.repository';
import { PdfConversionJobData } from '../interfaces/job-data.interface';
import { LibreOffice, PdfFormat } from 'chromiumly';
import { StorageBucket } from 'src/storage/storage.interface';
import { StorageService } from 'src/storage/storage.service';
import { JobService } from '../job.service';
import { QUEUES } from '../job.constants';
import { EventService } from 'src/events/event.service';
import { APP_EVENTS } from 'src/events/event.types';

@Processor(QUEUES.GOTENBERG_CONVERSION)
export class GotenbergProcessor extends WorkerHost {
  private readonly logger = new Logger(GotenbergProcessor.name);

  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly storageService: StorageService,
    private readonly jobService: JobService,
    private readonly eventService: EventService,
  ) {
    super();
  }

  async process(job: Job<PdfConversionJobData>): Promise<void> {
    const { documentId } = job.data;
    this.logger.log(`Processing PDF conversion job ${job.id}: ${documentId}`);

    try {
      const doc = await this.documentRepository.findById(documentId);
      if (!doc) throw new Error(`Document ${documentId} not found`);

      const originalPath = await this.storageService.resolveFilePath(
        documentId,
        doc.extension,
        StorageBucket.UPLOAD,
      );

      const buffer = await LibreOffice.convert({
        files: [originalPath],
        pdfa: PdfFormat.A_2b,
      });

      const archivePath = await this.storageService.writeBufferToBucket(
        buffer,
        documentId,
        '.pdf',
        StorageBucket.ARCHIVE,
      );
      this.logger.log(`Converted to PDF/A: ${archivePath}`);

      await Promise.all([
        this.jobService.addThumbnailJob(documentId),
        this.jobService.addTextExtractionJob(documentId),
      ]);
    } catch (error: unknown) {
      const jobError =
        error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `Job ${job.id} failed: ${jobError.message}`,
        jobError.stack,
      );
      const isFinalAttempt = job.attemptsMade + 1 >= (job.opts.attempts ?? 1);
      if (isFinalAttempt) {
        this.eventService.publish(APP_EVENTS.DOCUMENT_THUMBNAIL_FAILED, {
          documentId,
        });
      }
      throw jobError;
    }
  }
}
