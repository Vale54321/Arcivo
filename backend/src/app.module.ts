import { Module } from '@nestjs/common';
import { DocumentController } from './controllers/document.controller';
import { DocumentService } from './services/document.service';
import { LoggingRepository } from './repositories/logging.repository';
import { ConfigModule } from '@nestjs/config';
import { configValidationSchema } from './config.schema';
import { FileHashService } from './services/hash.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
      envFilePath: '../.env',
    }),
  ],
  controllers: [DocumentController],
  providers: [
    DocumentService,
    FileHashService,
    LoggingRepository,
  ],
})
export class AppModule { }
