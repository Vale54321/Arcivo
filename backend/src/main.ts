import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const bootLogger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const configService = app.get(ConfigService<any, true>);
  const port = configService.get<number>('PORT');

  bootLogger.log(`Starting server on port ${port}`);
  await app.listen(port);
}
bootstrap();
