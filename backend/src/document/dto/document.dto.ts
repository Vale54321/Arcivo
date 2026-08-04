import {
  IsISO8601,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class DocumentUploadDto {
  @ApiPropertyOptional({
    description: 'Original file creation time in ISO 8601 format',
    example: '2026-07-27T17:16:04.000Z',
  })
  @IsISO8601()
  @IsOptional()
  fileCreatedAt?: string;
}

export class UpdateDocumentDto {
  @ApiPropertyOptional({
    description: 'Display and download name of the document',
    example: 'invoice.pdf',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  @Matches(/\S/, { message: 'name must contain a non-space character' })
  @Matches(/^[^/\\]+$/, { message: 'name must not contain path separators' })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Document creation time in ISO 8601 format',
    example: '2026-07-27T17:16:04.000Z',
  })
  @IsISO8601()
  @IsOptional()
  fileCreatedAt?: string;
}
