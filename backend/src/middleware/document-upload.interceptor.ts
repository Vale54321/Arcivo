import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { unlink } from 'node:fs/promises';
import { of } from 'rxjs';
import {
  DocumentStatus,
  type DocumentResponseDto,
} from 'src/dtos/document.response.dto';
import { DocumentService } from 'src/services/document.service';
import { getMimeType, isSupportedMimeType } from 'src/utils/file-type';

export type DocumentUploadRequest = Request & {
  files?: { documentData?: Express.Multer.File[] };
};

@Injectable()
export class DocumentUploadInterceptor implements NestInterceptor {
  constructor(private service: DocumentService) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest<DocumentUploadRequest>();
    const res = context.switchToHttp().getResponse<Response>();

    const checksum: string = req.headers['x-arcivo-checksum'] as string;
    const filename: string = req.headers['x-arcivo-filename'] as string;

    if (!filename) {
      throw new BadRequestException('Missing x-arcivo-filename header');
    }

    const mimeType = getMimeType(filename);
    if (!isSupportedMimeType(mimeType)) {
      throw new UnsupportedMediaTypeException(
        'Only documents (PDF, Office, Text) are allowed.',
      );
    }

    if (checksum) {
      const duplicate = await this.service.getDocumentByChecksum(checksum);
      if (duplicate) {
        const tempPath = req.files?.documentData?.[0]?.path || undefined;
        if (tempPath) await this.deleteTempFile(tempPath);
        res.status(200);
        return of<DocumentResponseDto>({
          status: DocumentStatus.DUPLICATE,
          id: duplicate.id,
        });
      }
    }

    return next.handle();
  }

  private async deleteTempFile(filePath: string): Promise<void> {
    try {
      await unlink(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }
}
