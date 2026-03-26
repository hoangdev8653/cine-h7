import { Body, Controller, Delete, Get, Param, Patch, Query, Req, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { PaginationDto, UpdateRoleDto, UpdateUserDto } from "./dto/user.dto";
import { JwtAuthGuard } from "src/guards/jwt-auth.guard";

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get("")
    async getAllUsers(@Query() paginationDto: PaginationDto) {
        return await this.userService.getAllUsers(paginationDto);
    }

    @Get(":id")
    async getUserById(@Param('id') id: string) {
        return await this.userService.getUserById(id);
    }

    @Patch("update-role")
    @UseGuards(JwtAuthGuard)
    async updateRole(@Req() req: { user: { id: string } }, @Body() updateRoleDto: UpdateRoleDto) {
        const userId = req.user.id;
        return await this.userService.updateRole(userId, updateRoleDto);
    }

    @Patch(":id")
    @UseGuards(JwtAuthGuard)
    async updateUser(@Req() req: { user: { id: string } }, @Body() updateUserDto: UpdateUserDto) {
        const userId = req.user.id;
        return await this.userService.updateUser(userId, updateUserDto);
    }

    @Delete(":id")
    @UseGuards(JwtAuthGuard)
    async deleteUser(@Req() req: { user: { id: string } }) {
        const userId = req.user.id;
        return await this.userService.deleteUser(userId);
    }

}