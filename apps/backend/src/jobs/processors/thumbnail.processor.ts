import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { StorageService } from 'storage/storage.service';
import { DocumentRepository } from 'document/document.repository';
import { ThumbnailJobData } from '../interfaces/job-data.interface';
import { StorageBucket } from 'storage/storage.interface';
import { Poppler } from 'node-poppler';
import sharp from 'sharp';
import { QUEUES } from '../job.constants';
import { EventService } from 'events/event.service';
import { APP_EVENTS } from '@arcivo/api-contracts';
import { isPdfMimeType } from 'document/utils/file-type';

@Processor(QUEUES.THUMBNAIL_PROCESSING)
export class ThumbnailProcessor extends WorkerHost {
  private readonly logger = new Logger(ThumbnailProcessor.name);
  private readonly poppler = new Poppler();
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly storageService: StorageService,
    private readonly eventService: EventService,
  ) {
    super();
  }

  async process(job: Job<ThumbnailJobData>): Promise<void> {
    const { documentId } = job.data;
    let ownerId: string | undefined;
    this.logger.log(`Processing thumbnail job ${job.id}: ${documentId}`);
    try {
      const { documentId } = job.data;

      const doc = await this.documentRepository.findById(documentId);
      if (!doc) throw new Error(`Document ${documentId} not found`);
      ownerId = doc.ownerId;

      const isPdf = isPdfMimeType(doc.mimeType);
      const sourceFile = await this.storageService.resolveFilePath(
        documentId,
        isPdf ? doc.extension : '.pdf',
        isPdf ? StorageBucket.UPLOAD : StorageBucket.ARCHIVE,
      );
      const pngThumbnail = await this.storageService.resolveFilePath(
        documentId,
        '',
        StorageBucket.THUMBS,
        true,
      );
      const webpThumbnail = await this.storageService.resolveFilePath(
        documentId,
        '.webp',
        StorageBucket.THUMBS,
        true,
      );

      const options = {
        firstPageToConvert: 1,
        lastPageToConvert: 1,
        singleFile: true,
        pngFile: true,
      };

      await this.poppler.pdfToPpm(sourceFile, pngThumbnail, options);

      await sharp(`${pngThumbnail}.png`).webp({ quality: 80 }).toFile(webpThumbnail);

      await this.documentRepository.update(documentId, { hasThumbnail: true });
      this.eventService.publish(ownerId, APP_EVENTS.DOCUMENT_THUMBNAIL_GENERATED, {
        documentId,
      });
      this.logger.log(`Thumbnail generated: ${webpThumbnail}`);
    } catch (error: unknown) {
      const thumbnailError = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `Failed to generate thumbnail for document ${documentId}: ${thumbnailError.message}`,
        thumbnailError.stack,
      );
      const isFinalAttempt = job.attemptsMade + 1 >= (job.opts.attempts ?? 1);
      if (isFinalAttempt && ownerId) {
        this.eventService.publish(ownerId, APP_EVENTS.DOCUMENT_THUMBNAIL_FAILED, {
          documentId,
        });
      }
      throw thumbnailError;
    } finally {
      await this.storageService.deleteFromBucket(documentId, '.png', StorageBucket.THUMBS);
    }
  }
}
