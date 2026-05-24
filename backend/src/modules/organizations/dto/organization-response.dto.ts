import { Organization } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class OrganizationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(org: Partial<Organization>) {
    this.id = org.id as string;
    this.name = org.name as string;
    this.slug = org.slug as string;
    this.createdAt = org.createdAt as Date;
    this.updatedAt = org.updatedAt as Date;
  }
}
