import { Module, OnModuleInit } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { Chromiumly } from 'chromiumly';
import { QUEUES } from './job.constants';
import { JobService } from './job.service';
import { GotenbergProcessor } from './processors/gotenberg.processor';
import { StorageModule } from 'src/storage/storage.module';
import { DocumentRepository } from 'src/repositories/document.repository';
import { LoggingRepository } from 'src/repositories/logging.repository';

@Module({
    imports: [
        BullModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                connection: {
                    host: configService.get<string>('REDIS_HOST'),
                    port: configService.get<number>('REDIS_PORT'),
                },
            }),
        }),

        BullModule.registerQueue({ name: QUEUES.GOTENBERG_CONVERSION }),
        StorageModule,
    ],
    controllers: [],
    providers: [JobService, GotenbergProcessor, DocumentRepository, LoggingRepository],
    exports: [BullModule, JobService],
})
export class JobModule implements OnModuleInit {
    constructor(private readonly configService: ConfigService) { }

    onModuleInit(): void {
        Chromiumly.configure({
            endpoint: this.configService.getOrThrow<string>('GOTENBERG_URL'),
        });
    }
}
