import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'error', 'warn', 'debug'],
  });

  await app.init();

  const logger = new Logger('AiWorker');
  logger.log('AI extraction worker is running and consuming jobs');
}

bootstrap();
