import { Module } from '@nestjs/common';
import { DocumentController } from './controllers/document.controller';
import { DocumentService } from './services/document.service';
import { LoggingRepository } from './repositories/logging.repository';
import { DocumentRepository } from './repositories/document.repository';
import { ConfigModule } from '@nestjs/config';
import { configValidationSchema } from './config.schema';
import { DatabaseModule } from './database/database.module';
import { FileHashService } from './services/hash.service';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
      envFilePath: '../.env',
    }),
    DatabaseModule,
    StorageModule,
  ],
  controllers: [DocumentController],
  providers: [
    DocumentService,
    FileHashService,
    DocumentRepository,
    LoggingRepository,
  ],
})
export class AppModule { }
