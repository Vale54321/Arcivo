import * as argon2 from 'argon2';
import { Kysely, sql } from 'kysely';
import type { Database } from '../database.types';

const DEFAULT_ADMIN_PASSWORD = 'changeme';

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('users')
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('email', 'varchar(320)', (col) => col.notNull())
    .addColumn('displayName', 'varchar(100)', (col) => col.notNull())
    .addColumn('isAdmin', 'boolean', (col) => col.notNull().defaultTo(sql`false`))
    .addColumn('passwordHash', 'text', (col) => col.notNull())
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn('updatedAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`now()`))
    .execute();

  await db.schema
    .createIndex('users_email_unique_idx')
    .on('users')
    .columns([sql`lower("email")`])
    .unique()
    .execute();

  const defaultAdmin = await db
    .insertInto('users')
    .values({
      email: 'admin@example.com',
      displayName: 'Admin',
      isAdmin: true,
      passwordHash: await argon2.hash(DEFAULT_ADMIN_PASSWORD, {
        type: argon2.argon2id,
        memoryCost: 65_536,
        timeCost: 3,
        parallelism: 4,
      }),
    })
    .returning('id')
    .executeTakeFirstOrThrow();

  await db.updateTable('documents').set({ ownerId: defaultAdmin.id }).execute();

  await sql`
    CREATE FUNCTION prevent_last_admin_removal()
    RETURNS trigger AS $$
    BEGIN
      IF TG_OP = 'DELETE' THEN
        IF OLD."isAdmin" THEN
          -- Apply the same serialization to direct database writes.
          PERFORM pg_advisory_xact_lock(
            hashtext('arcivo:users:admin-role')
          );

          IF NOT EXISTS (
            SELECT 1
            FROM users
            WHERE "isAdmin" = true
              AND id <> OLD.id
          ) THEN
            RAISE EXCEPTION 'Cannot revoke the last administrator role'
              USING
                ERRCODE = 'check_violation',
                CONSTRAINT = 'users_require_admin';
          END IF;
        END IF;

        RETURN OLD;
      END IF;

      IF OLD."isAdmin" AND NOT NEW."isAdmin" THEN
        -- Apply the same serialization to direct database writes.
        PERFORM pg_advisory_xact_lock(
          hashtext('arcivo:users:admin-role')
        );

        IF NOT EXISTS (
          SELECT 1
          FROM users
          WHERE "isAdmin" = true
            AND id <> OLD.id
        ) THEN
          RAISE EXCEPTION 'Cannot revoke the last administrator role'
            USING
              ERRCODE = 'check_violation',
              CONSTRAINT = 'users_require_admin';
        END IF;
      END IF;

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql
  `.execute(db);

  await sql`
    CREATE TRIGGER users_prevent_last_admin_removal
    BEFORE UPDATE OF "isAdmin" OR DELETE ON users
    FOR EACH ROW
    EXECUTE FUNCTION prevent_last_admin_removal()
  `.execute(db);

  await db.schema
    .alterTable('documents')
    .addForeignKeyConstraint('documents_owner_id_fk', ['ownerId'], 'users', ['id'], (constraint) =>
      constraint.onDelete('restrict'),
    )
    .execute();
}

export async function down(db: Kysely<Database>): Promise<void> {
  await sql`
    DROP TRIGGER IF EXISTS users_prevent_last_admin_removal ON users
  `.execute(db);
  await sql`DROP FUNCTION IF EXISTS prevent_last_admin_removal()`.execute(db);
  await db.schema.alterTable('documents').dropConstraint('documents_owner_id_fk').execute();
  await db.schema.dropTable('users').execute();
}
