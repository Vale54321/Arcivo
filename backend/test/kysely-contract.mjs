import assert from 'node:assert/strict';
import test from 'node:test';
import { CamelCasePlugin, Kysely, PostgresDialect } from 'kysely';

function database(plugins) {
  return new Kysely({
    dialect: new PostgresDialect({ pool: {} }),
    plugins,
  });
}

test('CamelCasePlugin compiles application identifiers as snake_case', () => {
  const db = database([new CamelCasePlugin()]);
  const compiled = db
    .selectFrom('documents')
    .select(['ownerId', 'fileCreatedAt', 'hasThumbnail'])
    .where('ownerId', '=', '11111111-1111-4111-8111-111111111111')
    .compile();

  assert.match(compiled.sql, /"owner_id"/);
  assert.match(compiled.sql, /"file_created_at"/);
  assert.match(compiled.sql, /"has_thumbnail"/);
});

test('withoutPlugins preserves literal historical migration identifiers', () => {
  const migrationDb = database([new CamelCasePlugin()]).withoutPlugins();
  const compiled = migrationDb.schema
    .alterTable('documents')
    .renameColumn('fileCreatedAt', 'file_created_at')
    .compile();

  assert.match(compiled.sql, /"fileCreatedAt"/);
  assert.match(compiled.sql, /"file_created_at"/);
});
