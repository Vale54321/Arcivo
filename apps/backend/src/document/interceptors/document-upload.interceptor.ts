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
import 'multer';
import type { DocumentUploadResponse } from '@arcivo/api-contracts';
import { DocumentService } from '../document.service';
import type { AuthenticatedUser } from 'auth/interfaces/authenticated-user.interface';
import { getMimeType, isSupportedMimeType } from '../utils/file-type';
import { decodeUploadFilename } from '../utils/filename';

export type DocumentUploadRequest = Request & {
  files?: { documentData?: Express.Multer.File[] };
  arcivoFilename?: string;
  user: AuthenticatedUser;
};

@Injectable()
export class DocumentUploadInterceptor implements NestInterceptor {
  constructor(private service: DocumentService) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest<DocumentUploadRequest>();
    const res = context.switchToHttp().getResponse<Response>();

    const checksum: string = req.headers['x-arcivo-checksum'] as string;
    const rawFilename: string = req.headers['x-arcivo-filename'] as string;

    if (!rawFilename) {
      throw new BadRequestException('Missing x-arcivo-filename header');
    }

    const filename = decodeUploadFilename(rawFilename);
    if (!filename) {
      throw new BadRequestException(
        'x-arcivo-filename must be a URL-encoded UTF-8 file name',
      );
    }
    req.arcivoFilename = filename;

    const mimeType = getMimeType(filename);
    if (!isSupportedMimeType(mimeType)) {
      throw new UnsupportedMediaTypeException(
        'Only documents (PDF, Office, Text) are allowed.',
      );
    }

    if (checksum) {
      const duplicate = await this.service.getDocumentByChecksum(
        req.user.id,
        checksum,
      );
      if (duplicate) {
        const tempPath = req.files?.documentData?.[0]?.path || undefined;
        if (tempPath) await this.deleteTempFile(tempPath);
        res.status(200);
        return of<DocumentUploadResponse>({
          status: 'duplicate',
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
