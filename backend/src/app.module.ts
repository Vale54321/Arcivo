import { Module } from '@nestjs/common';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AppConfigModule } from './config/config.module';
import { DocumentModule } from './document/document.module';
import { EventModule } from './events/event.module';

@Module({
  imports: [
    AppConfigModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'client'),
      exclude: ['/api/{*any}'],
    }),
    EventModule,
    DocumentModule,
  ],
})
export class AppModule {}
