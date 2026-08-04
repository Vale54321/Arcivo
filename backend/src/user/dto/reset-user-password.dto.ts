import { PickType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class ResetUserPasswordDto extends PickType(CreateUserDto, [
  'password',
] as const) {}
