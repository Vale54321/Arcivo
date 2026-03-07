import { IsISO8601, IsOptional } from 'class-validator';

export class DocumentUploadDto {
  @IsISO8601()
  @IsOptional()
  fileCreatedAt?: string;
}
