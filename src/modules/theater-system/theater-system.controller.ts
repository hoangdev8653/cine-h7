import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseGuards, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { TheaterSystemService } from './theater-system.service';
import { CreateTheaterSystemDto, UpdateTheaterSystemDto } from './dto/theater-system.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaginationDto } from '../user/dto/user.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/role.guard';
import { Roles, UserRole } from 'src/common/enum/user.enum';

@Controller('theater-system')
export class TheaterSystemController {
    constructor(private readonly theaterSystemService: TheaterSystemService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Post()
    @UseInterceptors(FileInterceptor('logo'))
    async createTheaterSystem(@Body() createTheaterSystemDto: CreateTheaterSystemDto, @UploadedFile() file: Express.Multer.File) {
        return await this.theaterSystemService.createTheaterSystem(createTheaterSystemDto, file);

    }

    @Get()
    async getAllTheaterSystems(@Query() paginationDto: PaginationDto) {
        return await this.theaterSystemService.getAllTheaterSystems(paginationDto);
    }

    @Get(':id')
    async getTheaterSystemById(@Param('id', ParseUUIDPipe) id: string) {
        return await this.theaterSystemService.getTheaterSystemById(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Patch(':id')
    async updateTheaterSystem(@Param('id', ParseUUIDPipe) id: string, @Body() updateTheaterSystemDto: UpdateTheaterSystemDto) {
        return await this.theaterSystemService.updateTheaterSystem(id, updateTheaterSystemDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Delete(':id')
    async deleteTheaterSystem(@Param('id', ParseUUIDPipe) id: string) {
        return await this.theaterSystemService.deleteTheaterSystem(id);
    }
}
