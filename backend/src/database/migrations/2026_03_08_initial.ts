import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('documents')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('checksum', 'bytea', (col) => col.notNull())
    .addColumn('name', 'varchar', (col) => col.notNull())
    .addColumn('extension', 'varchar', (col) => col.notNull())
    .addColumn('size', 'bigint', (col) => col.notNull())
    .addColumn('mimeType', 'varchar', (col) => col.notNull())
    .addColumn('ownerId', 'uuid', (col) => col.notNull())
    .addColumn('fileCreatedAt', 'timestamptz', (col) => col.notNull())
    .addColumn('createdAt', 'timestamptz', (col) => col.defaultTo(sql`now()`))
    .addColumn('hasThumbnail', 'boolean', (col) =>
      col.notNull().defaultTo(false),
    )
    .addColumn('textContent', 'text')
    .execute();

  await db.schema
    .createIndex('document_checksum_owner_idx')
    .on('documents')
    .columns(['ownerId', 'checksum'])
    .unique()
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('documents').execute();
}
