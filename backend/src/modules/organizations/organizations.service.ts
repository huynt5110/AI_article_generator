import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { Organization, Role } from '@prisma/client';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { ConflictException } from '../../common/exceptions/application.exception';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: CreateOrganizationDto): Promise<Organization> {
    const existing = await this.prisma.organization.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      throw new ConflictException('Organization with this slug already exists');
    }

    return this.prisma.organization.create({
      data: {
        name: data.name,
        slug: data.slug,
        members: {
          create: {
            userId,
            role: Role.OWNER,
          },
        },
      },
    });
  }

  async findByUserId(userId: string): Promise<Organization[]> {
    const memberships = await this.prisma.organizationMember.findMany({
      where: { userId },
      include: { organization: true },
    });
    return memberships.map((m) => m.organization);
  }

  async verifyMembership(userId: string, orgId: string): Promise<{ isMember: boolean; role?: Role }> {
    const member = await this.prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: orgId,
        },
      },
    });

    return {
      isMember: !!member,
      role: member?.role,
    };
  }
}
