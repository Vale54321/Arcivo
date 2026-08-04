import { IsISO8601, IsOptional } from 'class-validator';
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
    description: 'Document creation time in ISO 8601 format',
    example: '2026-07-27T17:16:04.000Z',
  })
  @IsISO8601()
  @IsOptional()
  fileCreatedAt?: string;
}
