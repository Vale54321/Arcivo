import { Inject, Injectable } from '@nestjs/common';
import { Kysely, sql } from 'kysely';
import {
  Database,
  NewUser,
  UserCredentialsEntity,
  UserEntity,
  UserUpdate,
} from 'database/database.types';

type CreateUserData = Pick<NewUser, 'email' | 'displayName' | 'passwordHash'>;
export type UpdateUserData = Pick<UserUpdate, 'email' | 'displayName' | 'isAdmin' | 'updatedAt'>;

const ADMIN_ROLE_LOCK_KEY = 'arcivo:users:admin-role';

@Injectable()
export class UserRepository {
  constructor(@Inject(Kysely) private readonly db: Kysely<Database>) {}

  async create(data: CreateUserData): Promise<UserEntity> {
    return await this.db
      .insertInto('users')
      .values(data)
      .returning(['id', 'email', 'displayName', 'isAdmin', 'createdAt', 'updatedAt'])
      .executeTakeFirstOrThrow();
  }

  async findAll(): Promise<UserEntity[]> {
    return await this.db
      .selectFrom('users')
      .select(['id', 'email', 'displayName', 'isAdmin', 'createdAt', 'updatedAt'])
      .orderBy('createdAt', 'asc')
      .execute();
  }

  async findById(id: string): Promise<UserEntity | undefined> {
    return await this.db
      .selectFrom('users')
      .select(['id', 'email', 'displayName', 'isAdmin', 'createdAt', 'updatedAt'])
      .where('id', '=', id)
      .executeTakeFirst();
  }

  async findByEmail(email: string): Promise<UserEntity | undefined> {
    return await this.db
      .selectFrom('users')
      .select(['id', 'email', 'displayName', 'isAdmin', 'createdAt', 'updatedAt'])
      .where(sql<string>`lower("email")`, '=', email.trim().toLowerCase())
      .executeTakeFirst();
  }

  async findByEmailForAuthentication(email: string): Promise<UserCredentialsEntity | undefined> {
    return await this.db
      .selectFrom('users')
      .select(['id', 'email', 'displayName', 'isAdmin', 'passwordHash'])
      .where(sql<string>`lower("email")`, '=', email.trim().toLowerCase())
      .executeTakeFirst();
  }

  async update(id: string, data: UpdateUserData): Promise<UserEntity | undefined> {
    if (data.isAdmin === undefined) {
      return await this.updateWithDatabase(this.db, id, data);
    }

    return await this.db.transaction().execute(async (trx) => {
      // Lock before UPDATE so concurrent demotions see committed role changes.
      await sql`
        SELECT pg_advisory_xact_lock(hashtext(${ADMIN_ROLE_LOCK_KEY}))
      `.execute(trx);
      return await this.updateWithDatabase(trx, id, data);
    });
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<UserEntity | undefined> {
    return await this.db
      .updateTable('users')
      .set({ passwordHash, updatedAt: new Date() })
      .where('id', '=', id)
      .returning(['id', 'email', 'displayName', 'isAdmin', 'createdAt', 'updatedAt'])
      .executeTakeFirst();
  }

  private async updateWithDatabase(
    db: Kysely<Database>,
    id: string,
    data: UpdateUserData,
  ): Promise<UserEntity | undefined> {
    return await db
      .updateTable('users')
      .set(data)
      .where('id', '=', id)
      .returning(['id', 'email', 'displayName', 'isAdmin', 'createdAt', 'updatedAt'])
      .executeTakeFirst();
  }
}
