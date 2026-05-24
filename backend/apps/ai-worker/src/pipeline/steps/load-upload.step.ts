import { Injectable } from '@nestjs/common';
import { ExtractionJobStatus } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { S3Service } from '../../infrastructure/s3/s3.service';
import type { ExtractionContext } from '../extraction.context';
import type { PipelineStep } from '../pipeline-step.interface';
import { setJobStatus } from './job-status.helper';

@Injectable()
export class LoadUploadStep implements PipelineStep {
  readonly name = 'load-upload';

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  async execute(context: ExtractionContext): Promise<void> {
    const upload = await this.prisma.upload.findUnique({
      where: { id: context.uploadId },
    });

    if (!upload) {
      throw new Error(`Upload not found: ${context.uploadId}`);
    }

    context.upload = upload;

    await setJobStatus(this.prisma, context.jobId, ExtractionJobStatus.PARSING, {
      startedAt: new Date(),
    });

    context.fileBuffer = await this.s3Service.downloadFile(
      upload.s3Key,
      upload.bucket,
    );
  }
}
