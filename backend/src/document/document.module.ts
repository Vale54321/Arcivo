import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { EventModule } from 'src/events/event.module';
import { JobModule } from 'src/jobs/job.module';
import { GotenbergProcessor } from 'src/jobs/processors/gotenberg.processor';
import { TextExtractionProcessor } from 'src/jobs/processors/text-extraction.processor';
import { ThumbnailProcessor } from 'src/jobs/processors/thumbnail.processor';
import { LoggingModule } from 'src/logging/logging.module';
import { StorageModule } from 'src/storage/storage.module';
import { DocumentController } from './document.controller';
import { DocumentRepository } from './document.repository';
import { DocumentService } from './document.service';
import { DocumentUploadInterceptor } from './interceptors/document-upload.interceptor';
import { FileHashService } from './services/file-hash.service';

@Module({
  imports: [
    DatabaseModule,
    StorageModule,
    EventModule,
    JobModule,
    LoggingModule,
  ],
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
