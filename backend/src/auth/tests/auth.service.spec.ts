import { JwtService } from '@nestjs/jwt';
import { UserCredentialsEntity, UserEntity } from 'database/database.types';
import { PasswordService } from 'user/password.service';
import { UserService } from 'user/user.service';
import { AuthService } from '../auth.service';

jest.mock('kysely', () => ({ Kysely: class Kysely {} }));

describe(AuthService.name, () => {
  const user: UserEntity = {
    id: '11111111-1111-4111-8111-111111111111',
    email: 'admin@example.com',
    displayName: 'Admin',
    isAdmin: true,
    createdAt: new Date('2026-08-03T00:00:00.000Z'),
    updatedAt: new Date('2026-08-03T00:00:00.000Z'),
  };

  const credentials: UserCredentialsEntity = {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    isAdmin: user.isAdmin,
    passwordHash: 'argon2id-password-hash',
  };

  let signAsync: jest.Mock;
  let findByEmailForAuthentication: jest.MockedFunction<
    UserService['findByEmailForAuthentication']
  >;
  let verify: jest.MockedFunction<PasswordService['verify']>;
  let service: AuthService;

  beforeEach(() => {
    signAsync = jest.fn().mockResolvedValue('signed.jwt.token');
    findByEmailForAuthentication = jest.fn();
    verify = jest.fn();
    service = new AuthService(
      { signAsync } as unknown as JwtService,
      { findByEmailForAuthentication } as unknown as UserService,
      { verify } as unknown as PasswordService,
    );
  });

  it('issues a token with the user identity and authorization claims', async () => {
    await expect(service.issueAccessToken(user)).resolves.toEqual({
      accessToken: 'signed.jwt.token',
    });

    expect(signAsync).toHaveBeenCalledWith({
      sub: user.id,
      email: user.email,
      isAdmin: true,
    });
  });

  it('authenticates valid credentials and returns an access token', async () => {
    findByEmailForAuthentication.mockResolvedValue(credentials);
    verify.mockResolvedValue(true);

    await expect(
      service.login({
        email: user.email,
        password: 'correct horse battery staple',
      }),
    ).resolves.toEqual({ accessToken: 'signed.jwt.token' });

    expect(verify).toHaveBeenCalledWith(
      credentials.passwordHash,
      'correct horse battery staple',
    );
  });

  it('rejects unknown users after a dummy password verification', async () => {
    findByEmailForAuthentication.mockResolvedValue(undefined);
    verify.mockResolvedValue(true);

    await expect(
      service.login({
        email: user.email,
        password: 'correct horse battery staple',
      }),
    ).rejects.toThrow('Invalid email or password');

    expect(verify).toHaveBeenCalledWith(
      expect.stringMatching(/^\$argon2id\$/),
      'correct horse battery staple',
    );
  });
});
