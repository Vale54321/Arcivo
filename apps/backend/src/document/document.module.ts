import { Module } from '@nestjs/common';
import { DatabaseModule } from 'database/database.module';
import { EventModule } from 'events/event.module';
import { JobModule } from 'jobs/job.module';
import { GotenbergProcessor } from 'jobs/processors/gotenberg.processor';
import { TextExtractionProcessor } from 'jobs/processors/text-extraction.processor';
import { ThumbnailProcessor } from 'jobs/processors/thumbnail.processor';
import { LoggingModule } from 'logging/logging.module';
import { StorageModule } from 'storage/storage.module';
import { DocumentController } from './document.controller';
import { DocumentRepository } from './document.repository';
import { DocumentService } from './document.service';
import { DocumentUploadInterceptor } from './interceptors/document-upload.interceptor';
import { FileHashService } from './services/file-hash.service';

@Module({
  imports: [DatabaseModule, StorageModule, EventModule, JobModule, LoggingModule],
  controllers: [DocumentController],
  providers: [
    DocumentService,
    DocumentRepository,
    DocumentUploadInterceptor,
    FileHashService,
    GotenbergProcessor,
    ThumbnailProcessor,
    TextExtractionProcessor,
  ],
  exports: [DocumentService],
})
export class DocumentModule {}
