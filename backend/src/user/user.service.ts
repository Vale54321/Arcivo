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
import type {
  CreateUserRequest,
  ResetUserPasswordRequest,
  UpdateUserRequest,
  UserResponse,
} from '@arcivo/api-contracts';
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

  async create(dto: CreateUserRequest): Promise<UserResponse> {
    try {
      const user = await this.userRepository.create({
        email: this.normalizeEmail(dto.email),
        displayName: dto.displayName.trim(),
        passwordHash: await this.passwordService.hash(dto.password),
      });
      this.logger.log(`Created user ${user.id}`);
      return this.toResponse(user);
    } catch (error) {
      this.rethrowDatabaseConflict(error);
    }
  }

  async findAll(): Promise<UserResponse[]> {
    return (await this.userRepository.findAll()).map((user) =>
      this.toResponse(user),
    );
  }

  async findById(id: string): Promise<UserResponse> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return this.toResponse(user);
  }

  async findByEmailForAuthentication(
    email: string,
  ): Promise<UserCredentialsEntity | undefined> {
    return await this.userRepository.findByEmailForAuthentication(
      this.normalizeEmail(email),
    );
  }

  async update(id: string, dto: UpdateUserRequest): Promise<UserResponse> {
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
      return this.toResponse(user);
    } catch (error) {
      this.rethrowDatabaseConflict(error);
    }
  }

  async resetPassword(
    id: string,
    dto: ResetUserPasswordRequest,
  ): Promise<void> {
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

  private toResponse(user: UserEntity): UserResponse {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
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
