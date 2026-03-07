import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { DocumentUploadDto } from 'src/dtos/document.dto';
import { LoggingRepository } from 'src/repositories/logging.repository';
import { DocumentService } from 'src/services/document.service';

@Controller('document')
export class DocumentController {
  constructor(
    private logger: LoggingRepository,
    private service: DocumentService,
  ) { }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'documentData', maxCount: 1 },
    ], {
      dest: './temp/uploads'
    })
  )
  async uploadDocument(
    @UploadedFiles() files: { documentData?: Express.Multer.File[] },
    @Body() dto: DocumentUploadDto,
  ) {
    const file = files.documentData?.[0];

    if (!file) throw new BadRequestException('No file uploaded');

    return this.service.uploadDocument(dto, file);
  }
}