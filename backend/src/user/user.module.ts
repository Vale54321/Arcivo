import { Module } from '@nestjs/common';
import { DatabaseModule } from 'database/database.module';
import { LoggingModule } from 'logging/logging.module';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import { PasswordService } from './password.service';

@Module({
  imports: [DatabaseModule, LoggingModule],
  controllers: [UserController],
  providers: [UserRepository, UserService, PasswordService],
  exports: [UserService, PasswordService],
})
export class UserModule {}
