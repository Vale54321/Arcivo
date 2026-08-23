import { ConfigService } from '@nestjs/config';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import type { UserResponse } from '@arcivo/api-contracts';
import { UserService } from 'user/user.service';
import { JwtStrategy } from '../strategies/jwt.strategy';

jest.mock('kysely', () => ({ Kysely: class Kysely {} }));

describe(JwtStrategy.name, () => {
  const user: UserResponse = {
    id: '11111111-1111-4111-8111-111111111111',
    email: 'admin@example.com',
    displayName: 'Admin',
    isAdmin: true,
    createdAt: '2026-08-03T00:00:00.000Z',
    updatedAt: '2026-08-03T00:00:00.000Z',
  };

  let findById: jest.MockedFunction<UserService['findById']>;
  let strategy: JwtStrategy;

  beforeEach(() => {
    findById = jest.fn();
    strategy = new JwtStrategy(
      {
        getOrThrow: jest.fn().mockReturnValue('a'.repeat(32)),
      } as unknown as ConfigService,
      { findById } as unknown as UserService,
    );
  });

  it('hydrates the JWT principal from the current database user', async () => {
    findById.mockResolvedValue(user);

    await expect(
      strategy.validate({
        sub: user.id,
        email: user.email,
        isAdmin: true,
      }),
    ).resolves.toEqual({
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      isAdmin: true,
    });
  });

  it('rejects a JWT whose user no longer exists', async () => {
    findById.mockRejectedValue(new NotFoundException());

    await expect(
      strategy.validate({
        sub: user.id,
        email: user.email,
        isAdmin: true,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
