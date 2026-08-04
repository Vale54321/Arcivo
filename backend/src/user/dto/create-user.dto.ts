import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com', maxLength: 320 })
  @IsEmail()
  @MaxLength(320)
  email!: string;

  @ApiProperty({ example: 'Ada Lovelace', maxLength: 100 })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @Matches(/\S/, { message: 'displayName must contain a non-space character' })
  displayName!: string;

  @ApiProperty({
    format: 'password',
    minLength: 8,
    maxLength: 128,
    writeOnly: true,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}
