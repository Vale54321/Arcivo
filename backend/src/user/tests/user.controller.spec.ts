import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Server } from 'node:http';
import request from 'supertest';
import type { Request } from 'express';
import { UserEntity } from 'database/database.types';
import { JwtAuthGuard } from 'auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from 'auth/interfaces/authenticated-user.interface';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';

jest.mock('kysely', () => ({ Kysely: class Kysely {} }));

describe(UserController.name, () => {
  let app: INestApplication<Server>;
  let userService: jest.Mocked<
    Pick<
      UserService,
      'create' | 'findAll' | 'findById' | 'resetPassword' | 'update'
    >
  >;
  let currentUser: AuthenticatedUser;

  const user: UserEntity = {
    id: '11111111-1111-4111-8111-111111111111',
    email: 'ada@example.com',
    displayName: 'Ada Lovelace',
    isAdmin: false,
    createdAt: new Date('2026-08-03T00:00:00.000Z'),
    updatedAt: new Date('2026-08-03T00:00:00.000Z'),
  };

  beforeEach(async () => {
    currentUser = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      isAdmin: true,
    };
    userService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      resetPassword: jest.fn(),
      update: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: userService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate(context: ExecutionContext): boolean {
          const request = context
            .switchToHttp()
            .getRequest<Request & { user?: AuthenticatedUser }>();
          request.user = currentUser;
          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication<INestApplication<Server>>();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('creates a user through the versioned route', async () => {
    userService.create.mockResolvedValue(user);

    await request(app.getHttpServer())
      .post('/api/v1/users')
      .send({
        email: 'ada@example.com',
        displayName: 'Ada Lovelace',
        password: 'correct horse battery staple',
      })
      .expect(201)
      .expect({
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      });
  });

  it('rejects malformed user input before calling the service', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/users')
      .send({
        email: 'not-an-email',
        displayName: 'Ada Lovelace',
        unexpected: true,
      })
      .expect(400);

    expect(userService.create).not.toHaveBeenCalled();
  });

  it('rejects malformed UUID route parameters', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/users/not-a-uuid')
      .expect(400);

    expect(userService.findById).not.toHaveBeenCalled();
  });

  it('gets the current user without requiring administrator access', async () => {
    currentUser.isAdmin = false;
    userService.findById.mockResolvedValue(user);

    await request(app.getHttpServer())
      .get('/api/v1/users/me')
      .expect(200)
      .expect({
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      });

    expect(userService.findById).toHaveBeenCalledWith(user.id);
  });

  it('allows only administrators to create or list users', async () => {
    currentUser.isAdmin = false;

    await request(app.getHttpServer())
      .post('/api/v1/users')
      .send({
        email: 'grace@example.com',
        displayName: 'Grace Hopper',
        password: 'correct horse battery staple',
      })
      .expect(403);
    await request(app.getHttpServer()).get('/api/v1/users').expect(403);

    expect(userService.create).not.toHaveBeenCalled();
    expect(userService.findAll).not.toHaveBeenCalled();
  });

  it('allows a user to read and update only their own account', async () => {
    currentUser.isAdmin = false;
    userService.findById.mockResolvedValue(user);
    userService.update.mockResolvedValue({
      ...user,
      displayName: 'Updated Ada',
    });

    await request(app.getHttpServer())
      .get(`/api/v1/users/${user.id}`)
      .expect(200);
    await request(app.getHttpServer())
      .patch(`/api/v1/users/${user.id}`)
      .send({ displayName: 'Updated Ada' })
      .expect(200);
    await request(app.getHttpServer())
      .get('/api/v1/users/22222222-2222-4222-8222-222222222222')
      .expect(403);

    expect(userService.findById).toHaveBeenCalledWith(user.id);
    expect(userService.update).toHaveBeenCalledWith(user.id, {
      displayName: 'Updated Ada',
    });
  });

  it('allows only administrators to change administrator status', async () => {
    currentUser.isAdmin = false;

    await request(app.getHttpServer())
      .patch(`/api/v1/users/${user.id}`)
      .send({ isAdmin: true })
      .expect(403);

    currentUser.isAdmin = true;
    userService.update.mockResolvedValue({ ...user, isAdmin: true });

    await request(app.getHttpServer())
      .patch(`/api/v1/users/${user.id}`)
      .send({ isAdmin: true })
      .expect(200);

    expect(userService.update).toHaveBeenLastCalledWith(user.id, {
      isAdmin: true,
    });
  });

  it('allows only administrators to reset user passwords', async () => {
    currentUser.isAdmin = false;

    await request(app.getHttpServer())
      .patch(`/api/v1/users/${user.id}/password`)
      .send({ password: 'new secure password' })
      .expect(403);

    currentUser.isAdmin = true;

    await request(app.getHttpServer())
      .patch(`/api/v1/users/${user.id}/password`)
      .send({ password: 'new secure password' })
      .expect(204);

    expect(userService.resetPassword).toHaveBeenCalledWith(user.id, {
      password: 'new secure password',
    });
  });
});
