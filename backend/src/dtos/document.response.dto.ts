import { ApiProperty } from '@nestjs/swagger';

export enum DocumentStatus {
  CREATED = 'created',
  DUPLICATE = 'duplicate',
}

export class DocumentResponseDto {
  @ApiProperty({
    enum: DocumentStatus,
    enumName: 'DocumentStatus',
    description: 'Upload status',
  })
  status!: DocumentStatus;

  @ApiProperty({ description: 'Document media ID' })
  id!: string;
}

export class DocumentDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'invoice.pdf' })
  name!: string;

  @ApiProperty({ example: '.pdf' })
  extension!: string;

  @ApiProperty({ example: 24576 })
  size!: number;

  @ApiProperty({ example: 'application/pdf' })
  mimeType!: string;

  @ApiProperty({ format: 'uuid' })
  ownerId!: string;

  @ApiProperty({ format: 'date-time' })
  fileCreatedAt!: Date;

  @ApiProperty({ format: 'date-time' })
  createdAt!: Date;

  @ApiProperty()
  hasThumbnail!: boolean;

  @ApiProperty({ nullable: true, type: String })
  textContent!: string | null;
}

export enum DocumentMatchType {
  FILENAME = 'filename',
  CONTENT = 'content',
  BOTH = 'both',
}

export class DocumentSearchResultDto extends DocumentDto {
  @ApiProperty({ enum: DocumentMatchType, enumName: 'DocumentMatchType' })
  matchType!: DocumentMatchType;
}
