import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  accessTokenResponseSchema,
  loginRequestSchema,
  type AccessTokenResponse,
  type LoginRequest,
} from '@arcivo/api-contracts';
import { ZodValidationPipe } from 'common/pipes/zod-validation.pipe';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Authenticate with an email address and password' })
  @ApiOkResponse({ description: 'Signed JWT access token' })
  @ApiBadRequestResponse({ description: 'Invalid login request' })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password' })
  async login(
    @Body(new ZodValidationPipe(loginRequestSchema)) dto: LoginRequest,
  ): Promise<AccessTokenResponse> {
    return accessTokenResponseSchema.parse(await this.authService.login(dto));
  }

  @Post('development-login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Sign in as the default administrator during local development' })
  @ApiOkResponse({ description: 'Signed JWT access token' })
  async developmentLogin(): Promise<AccessTokenResponse> {
    return accessTokenResponseSchema.parse(
      await this.authService.loginAsDefaultAdminForDevelopment(),
    );
  }
}
