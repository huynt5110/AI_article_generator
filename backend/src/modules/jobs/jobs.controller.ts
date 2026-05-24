import { Controller, Get, Param } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/types/jwt-payload.type';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get(':id')
  getJobStatus(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.jobsService.getJobStatus(id, user.sub);
  }
}
