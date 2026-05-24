import { Controller, Get, Patch, Body, Param, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { DraftsService } from '../services/drafts.service';
import { UpdateDraftDto } from '../dto/update-draft.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { DraftStatus } from '@prisma/client';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@Controller('drafts')
@UseGuards(JwtAuthGuard)
export class DraftsController {
  constructor(private readonly draftsService: DraftsService) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60000)
  async listDrafts(
    @CurrentUser() user: any,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: DraftStatus,
  ) {
    return this.draftsService.listDrafts(user, cursor, limit ? parseInt(limit, 10) : 20, status);
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60000)
  async getDraft(@CurrentUser() user: any, @Param('id') id: string) {
    return this.draftsService.getDraftDetail(user, id);
  }

  @Patch(':id')
  async updateDraft(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateDraftDto,
  ) {
    return this.draftsService.updateDraft(user, id, updateDto);
  }

  @Get(':id/revisions')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60000)
  async listRevisions(@CurrentUser() user: any, @Param('id') id: string) {
    return this.draftsService.listRevisions(user, id);
  }
}
