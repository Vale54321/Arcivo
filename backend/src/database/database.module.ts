import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kysely, ParseJSONResultsPlugin, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { LoggingRepository } from 'src/repositories/logging.repository';
import { DatabaseMigrationService } from './database-migration.service';
import { Database } from './database.types';

@Global()
@Module({
  providers: [
    LoggingRepository,
    {
      provide: Kysely,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Kysely<Database> => {
        const dialect = new PostgresDialect({
          pool: new Pool({
            host: configService.get<string>('DB_HOST'),
            port: configService.get<number>('DB_PORT'),
            user: configService.get<string>('DB_USERNAME'),
            password: configService.get<string>('DB_PASSWORD'),
            database: configService.get<string>('DB_DATABASE'),
          }),
        });

        return new Kysely<Database>({
          dialect,
          plugins: [new ParseJSONResultsPlugin()],
        });
      },
    },
    DatabaseMigrationService,
  ],
  exports: [Kysely],
})
export class DatabaseModule {}