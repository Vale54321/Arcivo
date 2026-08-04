import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from 'database/database.types';
import { UserService } from 'user/user.service';
import { PasswordService } from 'user/password.service';
import { AccessTokenDto } from './dto/access-token.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

const DUMMY_PASSWORD_HASH =
  '$argon2id$v=19$m=65536,p=4,t=3$/nCF7yxUaMMlTjcEon0smA$wtS04jbhulPEGPH8uMeXSyA2mAdH9R6NC8mgoYfB/SM';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly passwordService: PasswordService,
  ) {}

  async login(dto: LoginDto): Promise<AccessTokenDto> {
    const user = await this.userService.findByEmailForAuthentication(dto.email);
    const isPasswordValid = await this.passwordService.verify(
      user?.passwordHash ?? DUMMY_PASSWORD_HASH,
      dto.password,
    );
    if (!user || !isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return await this.issueAccessToken(user);
  }

  async issueAccessToken(
    user: Pick<UserEntity, 'id' | 'email' | 'isAdmin'>,
  ): Promise<AccessTokenDto> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    };

    return { accessToken: await this.jwtService.signAsync(payload) };
  }
}
