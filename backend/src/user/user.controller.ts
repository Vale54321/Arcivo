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
  ApiAdminOrSelf,
  ApiAdminOnly,
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
    summary: 'Create a user',
    description: 'Requires an authenticated administrator account.',
  })
  @ApiAdminOnly()
  @ApiCreatedResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid user data' })
  @ApiConflictResponse({ description: 'Email address is already in use' })
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return await this.userService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List users',
    description: 'Requires an authenticated administrator account.',
  })
  @ApiAdminOnly()
  @ApiOkResponse({ type: [UserResponseDto] })
  async findAll(): Promise<UserResponseDto[]> {
    return await this.userService.findAll();
  }

  @Get('me')
  @ApiOperation({ summary: 'Get the current user' })
  @ApiOkResponse({ type: UserResponseDto })
  async findCurrentUser(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    return await this.userService.findById(user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a user by ID',
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
  ): Promise<UserResponseDto> {
    return await this.userService.findById(id);
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
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: ResetUserPasswordDto,
  ): Promise<void> {
    await this.userService.resetPassword(id, dto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a user',
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
    if (!currentUser.isAdmin && dto.isAdmin !== undefined) {
      throw new ForbiddenException(
        'Only administrators can change admin status',
      );
    }
    return await this.userService.update(id, dto);
  }
}
