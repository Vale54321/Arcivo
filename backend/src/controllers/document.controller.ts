import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Header,
  Param,
  Post,
  StreamableFile,
  UploadedFiles,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { createReadStream } from 'node:fs';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { DocumentUploadDto } from 'src/dtos/document.dto';
import type { DocumentResponseDto } from 'src/dtos/document.response.dto';
import { DocumentUploadInterceptor } from 'src/middleware/document-upload.interceptor';
import { DocumentService } from 'src/services/document.service';

@Controller('document')
export class DocumentController {
  constructor(
    private service: DocumentService,
  ) { }

  @Post()
  @UseInterceptors(
    DocumentUploadInterceptor,
    FileFieldsInterceptor([
      { name: 'documentData', maxCount: 1 },
    ], {
      dest: './temp/uploads'
    })
  )
  async uploadDocument(
    @UploadedFiles() files: { documentData?: Express.Multer.File[] },
    @Body() dto: DocumentUploadDto,
  ): Promise<DocumentResponseDto> {
    const file = files.documentData?.[0];

    if (!file) throw new BadRequestException('No file uploaded');

    return this.service.uploadDocument(dto, file);
  }

  @Get()
  async getAll() {
    return await this.service.getAllDocuments();
  }

  @Get('search')
  async search(@Query('q') q: string) {
    if (!q?.trim()) throw new BadRequestException('Query parameter "q" is required');
    return await this.service.searchDocuments(q.trim());
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return await this.service.getDocumentById(id);
  }

  @Get(':id/file')
  async getFile(@Param('id') id: string): Promise<StreamableFile> {
    const documentFile = await this.service.getDocumentFile(id);
    const stream = createReadStream(documentFile.path);

    return new StreamableFile(stream, {
      type: documentFile.mimeType,
      disposition: `inline; filename="${documentFile.name}"`,
    });
  }

  @Get(':id/archive')
  async getArchive(@Param('id') id: string): Promise<StreamableFile> {
    const archiveFile = await this.service.getDocumentArchive(id);
    const stream = createReadStream(archiveFile.path);

    return new StreamableFile(stream, {
      type: 'application/pdf',
      disposition: `inline; filename="${archiveFile.name}"`,
    });
  }

  @Get(':id/thumbnail')
  @Header('Content-Type', 'image/webp')
  async getThumbnail(@Param('id') id: string): Promise<StreamableFile> {
    const thumbnailPath = await this.service.getDocumentThumbnailPath(id);
    const stream = createReadStream(thumbnailPath);
    return new StreamableFile(stream);
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteDocument(@Param('id') id: string) {
    return await this.service.deleteDocument(id);
  }
}