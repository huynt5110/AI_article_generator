import { Body, Controller, Get, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/types/jwt-payload.type';
import { UpdateUserDto } from './dto/update-user.dto';
import { NotFoundException } from '../../common/exceptions/application.exception';
import { UserResponseDto } from './dto/user-response.dto';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOkResponse({ type: UserResponseDto })
  async getProfile(@CurrentUser() user: JwtPayload): Promise<UserResponseDto> {
    const foundUser = await this.usersService.findById(user.sub);
    if (!foundUser) {
      throw new NotFoundException('User');
    }
    return this.usersService.sanitize(foundUser);
  }

  @Patch('me')
  @ApiOkResponse({ type: UserResponseDto })
  async updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const updatedUser = await this.usersService.update(user.sub, updateUserDto);
    return this.usersService.sanitize(updatedUser);
  }
}
