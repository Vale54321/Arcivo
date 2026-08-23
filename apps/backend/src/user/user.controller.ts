import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ApiAdminOrSelf, ApiAdminOnly } from 'auth/decorators/api-access.decorator';
import { CurrentUser } from 'auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from 'auth/interfaces/authenticated-user.interface';
import {
  createUserRequestSchema,
  idParamsSchema,
  resetUserPasswordRequestSchema,
  updateUserRequestSchema,
  type CreateUserRequest,
  type IdParams,
  type ResetUserPasswordRequest,
  type UpdateUserRequest,
  type UserResponse,
} from '@arcivo/api-contracts';
import { ZodValidationPipe } from 'common/pipes/zod-validation.pipe';
import { UserService } from './user.service';

@Controller('users')
@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a user',
    description: 'Requires an authenticated administrator account.',
  })
  @ApiAdminOnly()
  @ApiCreatedResponse({ description: 'User created' })
  @ApiBadRequestResponse({ description: 'Invalid user data' })
  @ApiConflictResponse({ description: 'Email address is already in use' })
  async create(
    @Body(new ZodValidationPipe(createUserRequestSchema))
    dto: CreateUserRequest,
  ): Promise<UserResponse> {
    return await this.userService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List users',
    description: 'Requires an authenticated administrator account.',
  })
  @ApiAdminOnly()
  @ApiOkResponse({ description: 'Users returned' })
  async findAll(): Promise<UserResponse[]> {
    return await this.userService.findAll();
  }

  @Get('me')
  @ApiOperation({ summary: 'Get the current user' })
  @ApiOkResponse({ description: 'Current user returned' })
  async findCurrentUser(@CurrentUser() user: AuthenticatedUser): Promise<UserResponse> {
    return await this.userService.findById(user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a user by ID',
    description: 'Requires an administrator account or the requested user account.',
  })
  @ApiAdminOrSelf()
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiOkResponse({ description: 'User returned' })
  @ApiBadRequestResponse({ description: 'Invalid user UUID' })
  @ApiNotFoundResponse({ description: 'User not found' })
  async findById(
    @Param(new ZodValidationPipe(idParamsSchema)) params: IdParams,
  ): Promise<UserResponse> {
    return await this.userService.findById(params.id);
  }

  @Patch(':id/password')
  @ApiOperation({
    summary: 'Reset a user password',
    description: 'Requires an authenticated administrator account.',
  })
  @ApiAdminOnly()
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiNoContentResponse({ description: 'Password reset' })
  @ApiBadRequestResponse({ description: 'Invalid password or user UUID' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @HttpCode(204)
  async resetPassword(
    @Param(new ZodValidationPipe(idParamsSchema)) params: IdParams,
    @Body(new ZodValidationPipe(resetUserPasswordRequestSchema))
    dto: ResetUserPasswordRequest,
  ): Promise<void> {
    await this.userService.resetPassword(params.id, dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a user',
    description:
      'Requires an administrator account or the requested user account. Only administrators can change the isAdmin field.',
  })
  @ApiAdminOrSelf()
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiOkResponse({ description: 'User updated' })
  @ApiBadRequestResponse({ description: 'Invalid user data or UUID' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiConflictResponse({ description: 'Email address is already in use' })
  async update(
    @Param(new ZodValidationPipe(idParamsSchema)) params: IdParams,
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body(new ZodValidationPipe(updateUserRequestSchema))
    dto: UpdateUserRequest,
  ): Promise<UserResponse> {
    if (!currentUser.isAdmin && dto.isAdmin !== undefined) {
      throw new ForbiddenException('Only administrators can change admin status');
    }
    return await this.userService.update(params.id, dto);
  }
}
