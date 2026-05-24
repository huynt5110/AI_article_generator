import { ExtractionJobStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

export async function updateExtractionJob(
  prisma: PrismaService,
  jobId: string,
  data: Prisma.ExtractionJobUpdateInput,
): Promise<void> {
  await prisma.extractionJob.update({ where: { id: jobId }, data });
}

export async function setJobStatus(
  prisma: PrismaService,
  jobId: string,
  status: ExtractionJobStatus,
  extra?: Prisma.ExtractionJobUpdateInput,
): Promise<void> {
  await updateExtractionJob(prisma, jobId, { status, ...extra });
}
