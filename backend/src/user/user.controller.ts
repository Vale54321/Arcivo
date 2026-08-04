import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
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
import {
  ApiAdminOnly,
  ApiAdminOrSelf,
} from 'auth/decorators/api-access.decorator';
import { CurrentUser } from 'auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from 'auth/interfaces/authenticated-user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { ResetUserPasswordDto } from './dto/reset-user-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user.response.dto';
import { UserService } from './user.service';

@Controller('users')
@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a user (admin only)',
    description: 'Requires an authenticated administrator account.',
  })
  @ApiAdminOnly()
  @ApiCreatedResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid user data' })
  @ApiConflictResponse({ description: 'Email address is already in use' })
  async create(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: CreateUserDto,
  ): Promise<UserResponseDto> {
    this.requireAdmin(currentUser);
    return await this.userService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List users (admin only)',
    description: 'Requires an authenticated administrator account.',
  })
  @ApiAdminOnly()
  @ApiOkResponse({ type: [UserResponseDto] })
  async findAll(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<UserResponseDto[]> {
    this.requireAdmin(currentUser);
    return await this.userService.findAll();
  }

  @Get('me')
  @ApiOperation({ summary: 'Get the current user' })
  @ApiOkResponse({ type: UserResponseDto })
  async findCurrentUser(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    return await this.userService.findById(currentUser.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a user by ID (admin or self)',
    description:
      'Requires an administrator account or the requested user account.',
  })
  @ApiAdminOrSelf()
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid user UUID' })
  @ApiNotFoundResponse({ description: 'User not found' })
  async findById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    this.requireAdminOrSelf(currentUser, id);
    return await this.userService.findById(id);
  }

  @Patch(':id/password')
  @ApiOperation({
    summary: 'Reset a user password (admin only)',
    description: 'Requires an authenticated administrator account.',
  })
  @ApiAdminOnly()
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiNoContentResponse({ description: 'Password reset' })
  @ApiBadRequestResponse({ description: 'Invalid password or user UUID' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @HttpCode(204)
  async resetPassword(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: ResetUserPasswordDto,
  ): Promise<void> {
    this.requireAdmin(currentUser);
    await this.userService.resetPassword(id, dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a user (admin or self)',
    description:
      'Requires an administrator account or the requested user account. Only administrators can change the isAdmin field.',
  })
  @ApiAdminOrSelf()
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid user data or UUID' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiConflictResponse({ description: 'Email address is already in use' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    this.requireAdminOrSelf(currentUser, id);
    if (!currentUser.isAdmin && dto.isAdmin !== undefined) {
      throw new ForbiddenException(
        'Only administrators can change admin status',
      );
    }
    return await this.userService.update(id, dto);
  }

  private requireAdmin(currentUser: AuthenticatedUser): void {
    if (!currentUser.isAdmin) {
      throw new ForbiddenException('Administrator access is required');
    }
  }

  private requireAdminOrSelf(
    currentUser: AuthenticatedUser,
    targetUserId: string,
  ): void {
    if (!currentUser.isAdmin && currentUser.id !== targetUserId) {
      throw new ForbiddenException('You can only access your own user account');
    }
  }
}
