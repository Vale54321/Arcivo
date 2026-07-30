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
import { JobModule } from './jobs/job.module';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { EventModule } from './events/event.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
      envFilePath: '../.env',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'client'),
      exclude: ['/api/{*any}'],
    }),
    DatabaseModule,
    StorageModule,
    EventModule,
    JobModule,
  ],
  controllers: [DocumentController],
  providers: [
    DocumentService,
    FileHashService,
    DocumentRepository,
    LoggingRepository,
  ],
})
export class AppModule {}
