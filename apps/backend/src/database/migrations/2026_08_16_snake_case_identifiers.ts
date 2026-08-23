import { Kysely, sql } from 'kysely';

const documentColumns = [
  ['mimeType', 'mime_type'],
  ['ownerId', 'owner_id'],
  ['fileCreatedAt', 'file_created_at'],
  ['createdAt', 'created_at'],
  ['hasThumbnail', 'has_thumbnail'],
  ['textContent', 'text_content'],
] as const;

const userColumns = [
  ['displayName', 'display_name'],
  ['isAdmin', 'is_admin'],
  ['passwordHash', 'password_hash'],
  ['createdAt', 'created_at'],
  ['updatedAt', 'updated_at'],
] as const;

export async function up(db: Kysely<any>): Promise<void> {
  await sql`DROP TRIGGER IF EXISTS users_prevent_last_admin_removal ON users`.execute(db);
  await sql`DROP FUNCTION IF EXISTS prevent_last_admin_removal()`.execute(db);

  for (const [from, to] of documentColumns) {
    await db.schema.alterTable('documents').renameColumn(from, to).execute();
  }
  for (const [from, to] of userColumns) {
    await db.schema.alterTable('users').renameColumn(from, to).execute();
  }

  await createLastAdminGuard(db, 'is_admin');
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP TRIGGER IF EXISTS users_prevent_last_admin_removal ON users`.execute(db);
  await sql`DROP FUNCTION IF EXISTS prevent_last_admin_removal()`.execute(db);

  for (const [from, to] of [...documentColumns].reverse()) {
    await db.schema.alterTable('documents').renameColumn(to, from).execute();
  }
  for (const [from, to] of [...userColumns].reverse()) {
    await db.schema.alterTable('users').renameColumn(to, from).execute();
  }

  await createLastAdminGuard(db, 'isAdmin');
}

async function createLastAdminGuard(
  db: Kysely<any>,
  adminColumn: 'is_admin' | 'isAdmin',
): Promise<void> {
  const adminIdentifier = sql.ref(adminColumn);
  await sql`
    CREATE FUNCTION prevent_last_admin_removal()
    RETURNS trigger AS $$
    BEGIN
      IF TG_OP = 'DELETE' THEN
        IF OLD.${adminIdentifier} THEN
          PERFORM pg_advisory_xact_lock(hashtext('arcivo:users:admin-role'));
          IF NOT EXISTS (
            SELECT 1 FROM users
            WHERE ${adminIdentifier} = true AND id <> OLD.id
          ) THEN
            RAISE EXCEPTION 'Cannot revoke the last administrator role'
              USING ERRCODE = 'check_violation', CONSTRAINT = 'users_require_admin';
          END IF;
        END IF;
        RETURN OLD;
      END IF;

      IF OLD.${adminIdentifier} AND NOT NEW.${adminIdentifier} THEN
        PERFORM pg_advisory_xact_lock(hashtext('arcivo:users:admin-role'));
        IF NOT EXISTS (
          SELECT 1 FROM users
          WHERE ${adminIdentifier} = true AND id <> OLD.id
        ) THEN
          RAISE EXCEPTION 'Cannot revoke the last administrator role'
            USING ERRCODE = 'check_violation', CONSTRAINT = 'users_require_admin';
        END IF;
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql
  `.execute(db);

  await sql`
    CREATE TRIGGER users_prevent_last_admin_removal
    BEFORE UPDATE OF ${adminIdentifier} OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION prevent_last_admin_removal()
  `.execute(db);
}
