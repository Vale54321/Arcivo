import { Module } from '@nestjs/common';
import { DocumentController } from './controllers/document.controller';
import { DocumentService } from './services/document.service';
import { LoggingRepository } from './repositories/logging.repository';

@Module({
  imports: [],
  controllers: [DocumentController],
  providers: [
    DocumentService,
    LoggingRepository,
  ],
})
export class AppModule { }
