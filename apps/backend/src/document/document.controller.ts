import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Header,
  Param,
  Patch,
  Post,
  Req,
  StreamableFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from 'auth/interfaces/authenticated-user.interface';
import { createReadStream } from 'node:fs';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import 'multer';
import {
  documentSearchQuerySchema,
  documentUploadRequestSchema,
  idParamsSchema,
  updateDocumentRequestSchema,
  type DocumentResponse,
  type DocumentSearchQuery,
  type DocumentSearchResultResponse,
  type DocumentSummaryResponse,
  type DocumentUploadRequest as DocumentUploadMetadataRequest,
  type DocumentUploadResponse,
  type IdParams,
  type UpdateDocumentRequest,
} from '@arcivo/api-contracts';
import { ZodValidationPipe } from 'common/pipes/zod-validation.pipe';
import {
  DocumentUploadInterceptor,
  type DocumentUploadRequest,
} from './interceptors/document-upload.interceptor';
import { DocumentService } from './document.service';
import { contentDisposition } from './utils/filename';

@Controller('document')
@ApiTags('documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class DocumentController {
  constructor(private service: DocumentService) {}

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
  @ApiResponse({ status: 200, description: 'Upload result' })
  @ApiResponse({ status: 400, description: 'Missing file or invalid metadata' })
  @ApiResponse({ status: 415, description: 'Unsupported document type' })
  @UseInterceptors(
    DocumentUploadInterceptor,
    FileFieldsInterceptor([{ name: 'documentData', maxCount: 1 }], {
      dest: './temp/uploads',
    }),
  )
  async uploadDocument(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFiles() files: { documentData?: Express.Multer.File[] },
    @Body(new ZodValidationPipe(documentUploadRequestSchema))
    dto: DocumentUploadMetadataRequest,
    @Req() req: DocumentUploadRequest,
  ): Promise<DocumentUploadResponse> {
    const file = files.documentData?.[0];

    if (!file) throw new BadRequestException('No file uploaded');
    if (!req.arcivoFilename) {
      throw new BadRequestException('Missing x-arcivo-filename header');
    }

    return this.service.uploadDocument(user.id, dto, file, req.arcivoFilename);
  }

  @Get()
  @ApiOperation({ summary: 'List all documents' })
  @ApiResponse({ status: 200, description: 'Documents returned' })
  async getAll(@CurrentUser() user: AuthenticatedUser): Promise<DocumentSummaryResponse[]> {
    return await this.service.getAllDocuments(user.id);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search documents' })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Filename or text search query',
  })
  @ApiResponse({ status: 200, description: 'Search results returned' })
  async search(
    @CurrentUser() user: AuthenticatedUser,
    @Query(new ZodValidationPipe(documentSearchQuerySchema))
    query: DocumentSearchQuery,
  ): Promise<DocumentSearchResultResponse[]> {
    return await this.service.searchDocuments(user.id, query.q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a document by ID' })
  @ApiParam({ name: 'id', description: 'Document UUID' })
  @ApiResponse({ status: 200, description: 'Document returned' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async getById(
    @CurrentUser() user: AuthenticatedUser,
    @Param(new ZodValidationPipe(idParamsSchema)) params: IdParams,
  ): Promise<DocumentResponse> {
    return await this.service.getDocumentById(user.id, params.id);
  }

  @Get(':id/file')
  @ApiOperation({ summary: 'Download the original document' })
  @ApiParam({ name: 'id', description: 'Document UUID' })
  async getFile(
    @CurrentUser() user: AuthenticatedUser,
    @Param(new ZodValidationPipe(idParamsSchema)) params: IdParams,
  ): Promise<StreamableFile> {
    const documentFile = await this.service.getDocumentFile(user.id, params.id);
    const stream = createReadStream(documentFile.path);

    return new StreamableFile(stream, {
      type: documentFile.mimeType,
      disposition: contentDisposition(documentFile.name),
    });
  }

  @Get(':id/archive')
  @ApiOperation({ summary: 'Download the PDF archive' })
  @ApiParam({ name: 'id', description: 'Document UUID' })
  async getArchive(
    @CurrentUser() user: AuthenticatedUser,
    @Param(new ZodValidationPipe(idParamsSchema)) params: IdParams,
  ): Promise<StreamableFile> {
    const archiveFile = await this.service.getDocumentArchive(user.id, params.id);
    const stream = createReadStream(archiveFile.path);

    return new StreamableFile(stream, {
      type: 'application/pdf',
      disposition: contentDisposition(archiveFile.name),
    });
  }

  @Get(':id/thumbnail')
  @ApiOperation({ summary: 'Get a document thumbnail' })
  @ApiParam({ name: 'id', description: 'Document UUID' })
  @Header('Content-Type', 'image/webp')
  async getThumbnail(
    @CurrentUser() user: AuthenticatedUser,
    @Param(new ZodValidationPipe(idParamsSchema)) params: IdParams,
  ): Promise<StreamableFile> {
    const thumbnailPath = await this.service.getDocumentThumbnailPath(user.id, params.id);
    const stream = createReadStream(thumbnailPath);
    return new StreamableFile(stream);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a document' })
  @ApiParam({ name: 'id', description: 'Document UUID' })
  @ApiResponse({ status: 204, description: 'Document deleted' })
  @HttpCode(204)
  async deleteDocument(
    @CurrentUser() user: AuthenticatedUser,
    @Param(new ZodValidationPipe(idParamsSchema)) params: IdParams,
  ): Promise<void> {
    return await this.service.deleteDocument(user.id, params.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update document metadata' })
  @ApiParam({ name: 'id', description: 'Document UUID' })
  @ApiResponse({ status: 200, description: 'Document updated' })
  async updateDocument(
    @CurrentUser() user: AuthenticatedUser,
    @Param(new ZodValidationPipe(idParamsSchema)) params: IdParams,
    @Body(new ZodValidationPipe(updateDocumentRequestSchema))
    dto: UpdateDocumentRequest,
  ): Promise<DocumentResponse> {
    return await this.service.updateDocument(user.id, params.id, dto);
  }
}
