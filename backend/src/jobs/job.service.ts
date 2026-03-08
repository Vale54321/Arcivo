import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JOB_OPTS, JOB_TYPES, QUEUES } from './job.constants';
import { PdfConversionJobData } from './interfaces/job-data.interface';
import { BaseService } from 'src/services/base.service';
import { LoggingRepository } from 'src/repositories/logging.repository';

@Injectable()
export class JobService extends BaseService {
    constructor(
        @InjectQueue(QUEUES.GOTENBERG_CONVERSION) private readonly gotenbergQueue: Queue,
        loggingRepository: LoggingRepository,
    ) {
        super(loggingRepository);
    }

    async addPdfConversionJob(documentId: string): Promise<void> {
        this.logger.log(`Adding PDF conversion job for document ${documentId}`);
        const data: PdfConversionJobData = { documentId };
        await this.gotenbergQueue.add(JOB_TYPES.CONVERT_TO_PDF, data, JOB_OPTS);
    }
}
