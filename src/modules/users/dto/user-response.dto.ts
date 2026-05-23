import { User } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string | null;

  @ApiProperty()
  lastName: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(user: Partial<User>) {
    this.id = user.id as string;
    this.email = user.email as string;
    this.firstName = user.firstName ?? null;
    this.lastName = user.lastName ?? null;
    this.createdAt = user.createdAt as Date;
    this.updatedAt = user.updatedAt as Date;
  }
}
