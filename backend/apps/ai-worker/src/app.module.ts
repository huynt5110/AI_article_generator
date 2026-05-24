import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import {
  DOCUMENT_EXTRACTION_DLQ,
  DOCUMENT_EXTRACTION_QUEUE,
} from '@app/shared';
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import s3Config from './config/s3.config';
import geminiConfig from './config/gemini.config';
import workerConfig from './config/worker.config';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { S3Service } from './infrastructure/s3/s3.service';
import { DocxParserService } from './services/docx-parser.service';
import { GeminiExtractionService } from './services/gemini-extraction.service';
import { ExtractionPipelineService } from './services/extraction-pipeline.service';
import { DeadLetterQueueService } from './services/dead-letter-queue.service';
import { DocumentExtractionProcessor } from './processors/document-extraction.processor';
import { ExtractionPipelineBuilder } from './pipeline/extraction-pipeline.builder';
import { LoadUploadStep } from './pipeline/steps/load-upload.step';
import { ParseDocumentStep } from './pipeline/steps/parse-document.step';
import { AiExtractStep } from './pipeline/steps/ai-extract.step';
import { PersistDraftStep } from './pipeline/steps/persist-draft.step';
import { CompleteJobStep } from './pipeline/steps/complete-job.step';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, redisConfig, s3Config, geminiConfig, workerConfig],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.getOrThrow<string>('redis.host'),
          port: configService.getOrThrow<number>('redis.port'),
          password: configService.get<string>('redis.password'),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      { name: DOCUMENT_EXTRACTION_QUEUE },
      {
        name: DOCUMENT_EXTRACTION_DLQ,
        defaultJobOptions: {
          removeOnComplete: false,
          removeOnFail: false,
        },
      },
    ),
    PrismaModule,
  ],
  providers: [
    S3Service,
    DocxParserService,
    GeminiExtractionService,
    ExtractionPipelineBuilder,
    LoadUploadStep,
    ParseDocumentStep,
    AiExtractStep,
    PersistDraftStep,
    CompleteJobStep,
    ExtractionPipelineService,
    DeadLetterQueueService,
    DocumentExtractionProcessor,
  ],
})
export class AppModule {}
