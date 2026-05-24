import { Controller, Get, Param } from '@nestjs/common';
import { DraftsService } from './drafts.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/types/jwt-payload.type';

@Controller('drafts')
export class DraftsController {
  constructor(private readonly draftsService: DraftsService) {}

  @Get(':id')
  getDraft(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.draftsService.getDraft(id, user.sub);
  }
}
