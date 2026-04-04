import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { PaginationDto, UpdateRoleDto, UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/role.guard';
import { Roles, UserRole } from '../../common/enum/user.enum';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('')
  // @Roles(UserRole.ADMIN)
  async getAllUsers(@Query() paginationDto: PaginationDto) {
    return await this.userService.getAllUsers(paginationDto);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  async getUserById(@Param('id') id: string) {
    return await this.userService.getUserById(id);
  }

  @Patch(':id/role')
  @Roles(UserRole.ADMIN)
  async updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return await this.userService.updateRole(id, updateRoleDto);
  }

  @Post('forget-password')
  async forgetPassword(@Body() body: { email: string }) {
    return await this.userService.forgetPassword(body.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { email: string; newPassword: string }) {
    return await this.userService.resetPassword(body.email, body.newPassword);
  }

  @Patch('update')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'avatar', maxCount: 1 }]))
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Req() req: { user: { id: string } },
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFiles()
    files: { avatar?: Express.Multer.File[] },
  ) {
    const userId = req.user.id;
    const avatar = files?.avatar?.[0];
    return await this.userService.updateUser(userId, updateUserDto, avatar);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteUser(@Req() req: { user: { id: string } }) {
    const userId = req.user.id;
    return await this.userService.deleteUser(userId);
  }
}
