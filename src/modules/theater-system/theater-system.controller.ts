import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { TheaterSystemService } from './theater-system.service';
import { CreateTheaterSystemDto } from './dto/create-theater-system.dto';
import { UpdateTheaterSystemDto } from './dto/update-theater-system.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('theater-system')
export class TheaterSystemController {
    constructor(private readonly theaterSystemService: TheaterSystemService) { }

    @Post()
    @UseInterceptors(FileInterceptor('logo'))
    async createTheaterSystem(@Body() createTheaterSystemDto: CreateTheaterSystemDto, @UploadedFile() file: Express.Multer.File) {
        return await this.theaterSystemService.createTheaterSystem(createTheaterSystemDto, file);

    }

    @Get()
    async getAllTheaterSystems() {
        return await this.theaterSystemService.getAllTheaterSystems();
    }

    @Get(':id')
    async getTheaterSystemById(@Param('id', ParseUUIDPipe) id: string) {
        return await this.theaterSystemService.getTheaterSystemById(id);
    }

    @Patch(':id')
    async updateTheaterSystem(@Param('id', ParseUUIDPipe) id: string, @Body() updateTheaterSystemDto: UpdateTheaterSystemDto) {
        return await this.theaterSystemService.updateTheaterSystem(id, updateTheaterSystemDto);
    }

    @Delete(':id')
    async deleteTheaterSystem(@Param('id', ParseUUIDPipe) id: string) {
        return await this.theaterSystemService.deleteTheaterSystem(id);
    }
}
