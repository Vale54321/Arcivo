import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger, UnsupportedMediaTypeException } from '@nestjs/common';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DocumentRepository } from 'document/document.repository';
import { PdfConversionJobData } from '../interfaces/job-data.interface';
import { LibreOffice, HtmlConverter, MarkdownConverter, PDFEngines, PdfFormat } from 'chromiumly';
import { StorageBucket } from 'storage/storage.interface';
import { StorageService } from 'storage/storage.service';
import { JobService } from '../job.service';
import { QUEUES } from '../job.constants';
import { EventService } from 'events/event.service';
import { APP_EVENTS } from '@arcivo/api-contracts';
import {
  isOfficeMimeType,
  isPdfMimeType,
  isTextMimeType,
  isWebMimeType,
} from 'document/utils/file-type';

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
    let ownerId: string | undefined;
    this.logger.log(`Processing PDF conversion job ${job.id}: ${documentId}`);

    try {
      const doc = await this.documentRepository.findById(documentId);
      if (!doc) throw new Error(`Document ${documentId} not found`);
      ownerId = doc.ownerId;

      const originalPath = await this.storageService.resolveFilePath(
        documentId,
        doc.extension,
        StorageBucket.UPLOAD,
      );

      const buffer = await this.convertToPdf(originalPath, doc.mimeType);

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
      const jobError = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Job ${job.id} failed: ${jobError.message}`, jobError.stack);
      const isFinalAttempt = job.attemptsMade + 1 >= (job.opts.attempts ?? 1);
      if (isFinalAttempt && ownerId) {
        this.eventService.publish(ownerId, APP_EVENTS.DOCUMENT_THUMBNAIL_FAILED, {
          documentId,
        });
      }
      throw jobError;
    }
  }

  private async convertToPdf(originalPath: string, mimeType: string): Promise<Buffer> {
    if (isPdfMimeType(mimeType)) {
      return PDFEngines.convert({
        files: [originalPath],
        pdfa: PdfFormat.A_2b,
      });
    } else if (isWebMimeType(mimeType)) {
      return this.convertHtmlToPdf(originalPath);
    } else if (mimeType === 'text/markdown') {
      return this.convertMarkdownToPdf(originalPath);
    } else if (isOfficeMimeType(mimeType) || isTextMimeType(mimeType)) {
      return LibreOffice.convert({
        files: [originalPath],
        pdfa: PdfFormat.A_2b,
      });
    }

    throw new UnsupportedMediaTypeException(`Unsupported document MIME type: ${mimeType}`);
  }

  private async convertMarkdownToPdf(originalPath: string): Promise<Buffer> {
    const markdownConverter = new MarkdownConverter();
    const workDir = await mkdtemp(join(tmpdir(), 'arcivo-markdown-'));
    const htmlPath = join(workDir, 'index.html');

    try {
      await writeFile(
        htmlPath,
        '<!doctype html><html><head><meta charset="utf-8"></head><body>{{ toHTML "file.md" }}</body></html>',
        'utf8',
      );

      const pdfBuffer = await markdownConverter.convert({
        html: htmlPath,
        markdown: originalPath,
      });

      return PDFEngines.convert({
        files: [pdfBuffer],
        pdfa: PdfFormat.A_2b,
      });
    } finally {
      await rm(workDir, { recursive: true, force: true });
    }
  }

  private async convertHtmlToPdf(originalPath: string): Promise<Buffer> {
    const htmlConverter = new HtmlConverter();
    const pdfBuffer = await htmlConverter.convert({ html: originalPath });

    return PDFEngines.convert({
      files: [pdfBuffer],
      pdfa: PdfFormat.A_2b,
    });
  }
}
