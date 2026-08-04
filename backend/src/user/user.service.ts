import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseError } from 'pg';
import { BaseService } from 'logging/base.service';
import { LoggingService } from 'logging/logging.service';
import { UserCredentialsEntity, UserEntity } from 'database/database.types';
import { CreateUserDto } from './dto/create-user.dto';
import { ResetUserPasswordDto } from './dto/reset-user-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PasswordService } from './password.service';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService extends BaseService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    loggingService: LoggingService,
  ) {
    super(loggingService);
  }

  async create(dto: CreateUserDto): Promise<UserEntity> {
    try {
      const user = await this.userRepository.create({
        email: this.normalizeEmail(dto.email),
        displayName: dto.displayName.trim(),
        passwordHash: await this.passwordService.hash(dto.password),
      });
      this.logger.log(`Created user ${user.id}`);
      return user;
    } catch (error) {
      this.rethrowDatabaseConflict(error);
    }
  }

  async findAll(): Promise<UserEntity[]> {
    return await this.userRepository.findAll();
  }

  async findById(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async findByEmailForAuthentication(
    email: string,
  ): Promise<UserCredentialsEntity | undefined> {
    return await this.userRepository.findByEmailForAuthentication(
      this.normalizeEmail(email),
    );
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserEntity> {
    if (
      dto.email === undefined &&
      dto.displayName === undefined &&
      dto.isAdmin === undefined
    ) {
      throw new BadRequestException('At least one field must be provided');
    }

    try {
      const user = await this.userRepository.update(id, {
        ...(dto.email !== undefined && {
          email: this.normalizeEmail(dto.email),
        }),
        ...(dto.displayName !== undefined && {
          displayName: dto.displayName.trim(),
        }),
        ...(dto.isAdmin !== undefined && { isAdmin: dto.isAdmin }),
        updatedAt: new Date(),
      });

      if (!user) throw new NotFoundException(`User ${id} not found`);

      this.logger.log(`Updated user ${id}`);
      return user;
    } catch (error) {
      this.rethrowDatabaseConflict(error);
    }
  }

  async resetPassword(id: string, dto: ResetUserPasswordDto): Promise<void> {
    const user = await this.userRepository.updatePasswordHash(
      id,
      await this.passwordService.hash(dto.password),
    );
    if (!user) throw new NotFoundException(`User ${id} not found`);

    this.logger.log(`Reset password for user ${id}`);
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private rethrowDatabaseConflict(error: unknown): never {
    if (error instanceof DatabaseError) {
      if (error.code === '23505') {
        throw new ConflictException('A user with this email already exists');
      }
      if (error.code === 'P0001') {
        throw new ConflictException('At least one administrator is required');
      }
    }
    throw error;
  }
}
