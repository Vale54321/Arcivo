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
import { UpdateUserData, UserRepository } from './user.repository';

const POSTGRES_ERROR_CODE = {
  uniqueViolation: '23505',
  checkViolation: '23514',
} as const;
const LAST_ADMIN_CONSTRAINT = 'users_require_admin';

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
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('At least one field must be provided');
    }

    const update: UpdateUserData = { ...dto, updatedAt: new Date() };
    if (update.email) update.email = this.normalizeEmail(update.email);
    if (update.displayName) update.displayName = update.displayName.trim();

    try {
      const user = await this.userRepository.update(id, update);

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
      if (error.code === POSTGRES_ERROR_CODE.uniqueViolation) {
        throw new ConflictException('A user with this email already exists');
      }
      if (
        error.code === POSTGRES_ERROR_CODE.checkViolation &&
        error.constraint === LAST_ADMIN_CONSTRAINT
      ) {
        throw new ConflictException('At least one administrator is required');
      }
    }
    throw error;
  }
}
