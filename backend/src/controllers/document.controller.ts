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
import {
  ApiBody,
  ApiConsumes,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { createReadStream } from 'node:fs';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { DocumentUploadDto } from 'src/dtos/document.dto';
import {
  DocumentDto,
  DocumentResponseDto,
  DocumentSearchResultDto,
} from 'src/dtos/document.response.dto';
import { DocumentUploadInterceptor } from 'src/middleware/document-upload.interceptor';
import { DocumentService } from 'src/services/document.service';

@Controller('document')
@ApiTags('documents')
export class DocumentController {
  constructor(
    private service: DocumentService,
  ) { }

  @Post()
  @ApiOperation({ summary: 'Upload a document' })
  @ApiConsumes('multipart/form-data')
  @ApiHeader({
    name: 'x-arcivo-checksum',
    required: false,
    description: 'SHA-1 checksum used to detect duplicate uploads',
  })
  @ApiHeader({
    name: 'x-arcivo-filename',
    required: true,
    description: 'URL-encoded original filename',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['documentData'],
      properties: {
        documentData: { type: 'string', format: 'binary' },
        fileCreatedAt: {
          type: 'string',
          format: 'date-time',
          nullable: true,
          example: '2026-07-27T17:16:04.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 200, type: DocumentResponseDto })
  @ApiResponse({ status: 400, description: 'Missing file or invalid metadata' })
  @ApiResponse({ status: 415, description: 'Unsupported document type' })
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
  @ApiOperation({ summary: 'List all documents' })
  @ApiResponse({ status: 200, type: [DocumentDto] })
  async getAll() {
    return await this.service.getAllDocuments();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search documents' })
  @ApiQuery({ name: 'q', required: true, description: 'Filename or text search query' })
  @ApiResponse({ status: 200, type: [DocumentSearchResultDto] })
  async search(@Query('q') q: string) {
    if (!q?.trim()) throw new BadRequestException('Query parameter "q" is required');
    return await this.service.searchDocuments(q.trim());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a document by ID' })
  @ApiParam({ name: 'id', description: 'Document UUID' })
  @ApiResponse({ status: 200, type: DocumentDto })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async getById(@Param('id') id: string) {
    return await this.service.getDocumentById(id);
  }

  @Get(':id/file')
  @ApiOperation({ summary: 'Download the original document' })
  @ApiParam({ name: 'id', description: 'Document UUID' })
  async getFile(@Param('id') id: string): Promise<StreamableFile> {
    const documentFile = await this.service.getDocumentFile(id);
    const stream = createReadStream(documentFile.path);

    return new StreamableFile(stream, {
      type: documentFile.mimeType,
      disposition: `inline; filename="${documentFile.name}"`,
    });
  }

  @Get(':id/archive')
  @ApiOperation({ summary: 'Download the PDF archive' })
  @ApiParam({ name: 'id', description: 'Document UUID' })
  async getArchive(@Param('id') id: string): Promise<StreamableFile> {
    const archiveFile = await this.service.getDocumentArchive(id);
    const stream = createReadStream(archiveFile.path);

    return new StreamableFile(stream, {
      type: 'application/pdf',
      disposition: `inline; filename="${archiveFile.name}"`,
    });
  }

  @Get(':id/thumbnail')
  @ApiOperation({ summary: 'Get a document thumbnail' })
  @ApiParam({ name: 'id', description: 'Document UUID' })
  @Header('Content-Type', 'image/webp')
  async getThumbnail(@Param('id') id: string): Promise<StreamableFile> {
    const thumbnailPath = await this.service.getDocumentThumbnailPath(id);
    const stream = createReadStream(thumbnailPath);
    return new StreamableFile(stream);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a document' })
  @ApiParam({ name: 'id', description: 'Document UUID' })
  @ApiResponse({ status: 204, description: 'Document deleted' })
  @HttpCode(204)
  async deleteDocument(@Param('id') id: string) {
    return await this.service.deleteDocument(id);
  }
}
