import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  async getJobStatus(jobId: string, userId: string) {
    const job = await this.prisma.extractionJob.findFirst({
      where: {
        id: jobId,
        upload: { userId },
      },
      include: {
        upload: {
          select: { id: true, originalName: true, status: true },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('Extraction job not found');
    }

    return {
      jobId: job.id,
      uploadId: job.uploadId,
      status: job.status,
      model: job.model,
      promptVersion: job.promptVersion,
      tokenInput: job.tokenInput,
      tokenOutput: job.tokenOutput,
      latencyMs: job.latencyMs,
      errorMessage: job.errorMessage,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      upload: job.upload,
    };
  }
}
