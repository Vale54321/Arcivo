import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JOB_OPTS, JOB_TYPES, QUEUES } from './job.constants';
import {
  PdfConversionJobData,
  TextExtractionJobData,
  ThumbnailJobData,
} from './interfaces/job-data.interface';
import { BaseService } from 'logging/base.service';
import { LoggingService } from 'logging/logging.service';

@Injectable()
export class JobService extends BaseService {
  constructor(
    @InjectQueue(QUEUES.GOTENBERG_CONVERSION)
    private readonly gotenbergQueue: Queue,
    @InjectQueue(QUEUES.THUMBNAIL_PROCESSING)
    private readonly thumbnailQueue: Queue,
    @InjectQueue(QUEUES.TEXT_EXTRACTION)
    private readonly textExtractionQueue: Queue,
    loggingService: LoggingService,
  ) {
    super(loggingService);
  }

  async addPdfConversionJob(documentId: string): Promise<void> {
    this.logger.log(`Adding PDF conversion job for document ${documentId}`);
    const data: PdfConversionJobData = { documentId };
    await this.gotenbergQueue.add(JOB_TYPES.CONVERT_TO_PDF, data, JOB_OPTS);
  }

  async addThumbnailJob(documentId: string): Promise<void> {
    const data: ThumbnailJobData = { documentId };
    await this.thumbnailQueue.add(JOB_TYPES.GENERATE_THUMBNAIL, data, JOB_OPTS);
  }

  async addTextExtractionJob(documentId: string): Promise<void> {
    const data: TextExtractionJobData = { documentId };
    await this.textExtractionQueue.add(JOB_TYPES.EXTRACT_TEXT, data, JOB_OPTS);
  }
}
