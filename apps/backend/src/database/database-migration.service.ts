import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Kysely } from 'kysely';
import { FileMigrationProvider, Migrator } from 'kysely/migration';
import * as fs from 'fs/promises';
import * as path from 'path';
import { LoggingService } from 'logging/logging.service';
import { Database } from './database.types';

@Injectable()
export class DatabaseMigrationService implements OnModuleInit {
  constructor(
    @Inject(Kysely) private readonly db: Kysely<Database>,
    private readonly logger: LoggingService,
  ) {
    this.logger.setContext(DatabaseMigrationService.name);
  }

  async onModuleInit(): Promise<void> {
    const migrator = new Migrator({
      // Historical migrations contain physical identifier spellings and must
      // never be transformed by application query plugins.
      db: this.db.withoutPlugins(),
      provider: new FileMigrationProvider({
        fs,
        path,
        migrationFolder: path.join(__dirname, 'migrations'),
      }),
    });

    const { error, results } = await migrator.migrateToLatest();

    for (const result of results ?? []) {
      if (result.status === 'Success') {
        this.logger.log(
          `Migration "${result.migrationName}" applied successfully`,
        );
      } else if (result.status === 'Error') {
        this.logger.error(`Migration "${result.migrationName}" failed`);
      }
    }

    if (error) {
      const migrationError =
        error instanceof Error
          ? error
          : new Error('Database migration failed', { cause: error });
      this.logger.error(migrationError, migrationError.stack);
      throw migrationError;
    }
  }
}
