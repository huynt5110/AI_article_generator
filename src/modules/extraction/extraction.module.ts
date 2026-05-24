import { Module } from '@nestjs/common';
import { QueueModule } from '../../infrastructure/queue/queue.module';
import { ExtractionQueueService } from './extraction-queue.service';

@Module({
  imports: [QueueModule],
  providers: [ExtractionQueueService],
  exports: [ExtractionQueueService],
})
export class ExtractionModule {}
