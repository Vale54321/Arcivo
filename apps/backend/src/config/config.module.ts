import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configValidationSchema } from './config.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
      envFilePath: ['../../.env', '../.env', '.env'],
    }),
  ],
})
export class AppConfigModule {}
