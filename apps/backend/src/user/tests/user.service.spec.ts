import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { DatabaseError } from 'pg';
import { UserEntity } from 'database/database.types';
import { LoggingService } from 'logging/logging.service';
import { UserRepository } from '../user.repository';
import { UserService } from '../user.service';
import { PasswordService } from '../password.service';

jest.mock('kysely', () => ({ Kysely: class Kysely {} }));

describe(UserService.name, () => {
  let service: UserService;
  let repository: jest.Mocked<UserRepository>;
  let createMock: jest.MockedFunction<UserRepository['create']>;
  let findByIdMock: jest.MockedFunction<UserRepository['findById']>;
  let updateMock: jest.MockedFunction<UserRepository['update']>;
  let updatePasswordHashMock: jest.MockedFunction<UserRepository['updatePasswordHash']>;
  let hashMock: jest.MockedFunction<PasswordService['hash']>;

  const user: UserEntity = {
    id: '11111111-1111-4111-8111-111111111111',
    email: 'ada@example.com',
    displayName: 'Ada Lovelace',
    isAdmin: false,
    createdAt: new Date('2026-08-03T00:00:00.000Z'),
    updatedAt: new Date('2026-08-03T00:00:00.000Z'),
  };

  beforeEach(() => {
    createMock = jest.fn();
    findByIdMock = jest.fn();
    updateMock = jest.fn();
    updatePasswordHashMock = jest.fn();
    hashMock = jest.fn().mockResolvedValue('argon2id-password-hash');
    repository = {
      create: createMock,
      findAll: jest.fn(),
      findById: findByIdMock,
      findByEmail: jest.fn(),
      findByEmailForAuthentication: jest.fn(),
      update: updateMock,
      updatePasswordHash: updatePasswordHashMock,
    } as unknown as jest.Mocked<UserRepository>;

    const loggingService = {
      setContext: jest.fn(),
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    } as unknown as LoggingService;

    service = new UserService(repository, { hash: hashMock, verify: jest.fn() }, loggingService);
  });

  it('normalizes user data before creating the record', async () => {
    createMock.mockResolvedValue(user);

    await expect(
      service.create({
        email: ' Ada@Example.com ',
        displayName: ' Ada Lovelace ',
        password: 'correct horse battery staple',
      }),
    ).resolves.toEqual({
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    });

    expect(createMock).toHaveBeenCalledWith({
      email: 'ada@example.com',
      displayName: 'Ada Lovelace',
      passwordHash: 'argon2id-password-hash',
    });
  });

  it('maps duplicate email errors to a conflict response', async () => {
    const error = new DatabaseError('duplicate key', 0, 'error');
    error.code = '23505';
    createMock.mockRejectedValue(error);

    await expect(
      service.create({
        email: user.email,
        displayName: user.displayName,
        password: 'correct horse battery staple',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('prevents revoking the final administrator role', async () => {
    const error = new DatabaseError('last administrator', 0, 'error');
    error.code = '23514';
    error.constraint = 'users_require_admin';
    updateMock.mockRejectedValue(error);

    await expect(service.update(user.id, { isAdmin: false })).rejects.toThrow(
      'At least one administrator is required',
    );
  });

  it('returns not found when the user does not exist', async () => {
    findByIdMock.mockResolvedValue(undefined);

    await expect(service.findById(user.id)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('hashes a password before resetting it', async () => {
    updatePasswordHashMock.mockResolvedValue(user);

    await expect(
      service.resetPassword(user.id, { password: 'new secure password' }),
    ).resolves.toBeUndefined();

    expect(updatePasswordHashMock).toHaveBeenCalledWith(user.id, 'argon2id-password-hash');
  });

  it('rejects an empty update', async () => {
    await expect(service.update(user.id, {})).rejects.toBeInstanceOf(BadRequestException);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it('normalizes updates and advances updatedAt', async () => {
    updateMock.mockResolvedValue({
      ...user,
      email: 'new@example.com',
    });

    await expect(service.update(user.id, { email: ' New@Example.com ' })).resolves.toMatchObject({
      email: 'new@example.com',
    });

    expect(updateMock).toHaveBeenCalledTimes(1);
    const [updatedUserId, update] = updateMock.mock.calls[0];
    expect(updatedUserId).toBe(user.id);
    expect(update.email).toBe('new@example.com');
    expect(update.updatedAt).toBeInstanceOf(Date);
  });

  it('passes all supplied update fields to the repository', async () => {
    updateMock.mockResolvedValue({ ...user, isAdmin: true });

    await service.update(user.id, { displayName: ' Ada ', isAdmin: true });

    expect(updateMock).toHaveBeenCalledWith(
      user.id,
      expect.objectContaining({ displayName: 'Ada', isAdmin: true }),
    );
  });
});
