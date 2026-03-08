import { ApiProperty } from '@nestjs/swagger';

export enum DocumentStatus {
  CREATED = 'created',
  DUPLICATE = 'duplicate',
}

export class DocumentResponseDto {
  @ApiProperty({ 
    enum: DocumentStatus, 
    enumName: 'DocumentStatus', 
    description: 'Upload status' 
  })
  status!: DocumentStatus;

  @ApiProperty({ description: 'Document media ID' })
  id!: string;
}