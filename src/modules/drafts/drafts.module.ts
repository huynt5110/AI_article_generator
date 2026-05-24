import { Module } from '@nestjs/common';
import { DraftsController } from './controllers/drafts.controller';
import { DraftsService } from './services/drafts.service';
import { PrismaDraftsRepository } from './repositories/drafts.repository';
import { DRAFTS_REPOSITORY } from './repositories/drafts.repository.interface';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { DraftsAccessPolicy } from './policies/drafts-access.policy';
import { ReplaceOperationStrategy } from './strategies/json-patch/replace-operation.strategy';
import { JsonPatchApplicator } from './strategies/json-patch/json-patch.applicator';
import { DraftMapper } from './mappers/draft.mapper';

@Module({
  imports: [PrismaModule],
  controllers: [DraftsController],
  providers: [
    DraftsService,
    DraftsAccessPolicy,
    ReplaceOperationStrategy,
    JsonPatchApplicator,
    DraftMapper,
    {
      provide: DRAFTS_REPOSITORY,
      useClass: PrismaDraftsRepository,
    },
  ],
})
export class DraftsModule {}
