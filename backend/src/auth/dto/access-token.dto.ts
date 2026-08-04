import { ApiProperty } from '@nestjs/swagger';

export class AccessTokenDto {
  @ApiProperty({ description: 'Signed JWT access token' })
  accessToken!: string;
}
