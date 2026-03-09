import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { TheaterSystemService } from './theater-system.service';
import { CreateTheaterSystemDto } from './dto/create-theater-system.dto';
import { UpdateTheaterSystemDto } from './dto/update-theater-system.dto';

@Controller('theater-systems')
export class TheaterSystemController {
    constructor(private readonly theaterSystemService: TheaterSystemService) { }

    @Post()
    create(@Body() createTheaterSystemDto: CreateTheaterSystemDto) {
        return this.theaterSystemService.create(createTheaterSystemDto);
    }

    @Get()
    findAll() {
        return this.theaterSystemService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.theaterSystemService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateTheaterSystemDto: UpdateTheaterSystemDto) {
        return this.theaterSystemService.update(id, updateTheaterSystemDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.theaterSystemService.remove(id);
    }
}
