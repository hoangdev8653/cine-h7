import { Body, Controller, Delete, Get, Param, Patch, Query } from "@nestjs/common";
import { UserService } from "./user.service";
import { PaginationDto, UpdateUserDto } from "./dto/user.dto";

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

    @Patch(":id")
    async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return await this.userService.updateUser(id, updateUserDto);
    }

    @Delete(":id")
    async deleteUser(@Param('id') id: string) {
        return await this.userService.deleteUser(id);
    }

}