import { Module, OnModuleInit } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { Chromiumly } from 'chromiumly';
import { LoggingModule } from 'logging/logging.module';
import { QUEUES } from './job.constants';
import { JobService } from './job.service';

@Module({
  imports: [
    LoggingModule,
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
        },
      }),
    }),
    BullModule.registerQueue(
      { name: QUEUES.GOTENBERG_CONVERSION },
      { name: QUEUES.THUMBNAIL_PROCESSING },
      { name: QUEUES.TEXT_EXTRACTION },
    ),
  ],
  providers: [JobService],
  exports: [BullModule, JobService],
})
export class JobModule implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    Chromiumly.configure({
      endpoint: this.configService.getOrThrow<string>('GOTENBERG_URL'),
    });
  }
}
