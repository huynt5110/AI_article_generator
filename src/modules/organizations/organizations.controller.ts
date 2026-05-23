import { Body, Controller, Get, Post } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/types/jwt-payload.type';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { OrganizationResponseDto } from './dto/organization-response.dto';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('organizations')
@ApiBearerAuth()
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @ApiOkResponse({ type: OrganizationResponseDto })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() createOrganizationDto: CreateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    const org = await this.organizationsService.create(user.sub, createOrganizationDto);
    return new OrganizationResponseDto(org);
  }

  @Get()
  @ApiOkResponse({ type: [OrganizationResponseDto] })
  async findAll(@CurrentUser() user: JwtPayload): Promise<OrganizationResponseDto[]> {
    const orgs = await this.organizationsService.findByUserId(user.sub);
    return orgs.map((org) => new OrganizationResponseDto(org));
  }
}
