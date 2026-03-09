import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { TheaterService } from './theater.service';
import { CreateTheaterDto } from './dto/create-theater.dto';
import { UpdateTheaterDto } from './dto/update-theater.dto';

@Controller('theaters')
export class TheaterController {
    constructor(private readonly theaterService: TheaterService) { }

    @Post()
    create(@Body() createTheaterDto: CreateTheaterDto) {
        return this.theaterService.create(createTheaterDto);
    }

    @Get()
    findAll() {
        return this.theaterService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.theaterService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateTheaterDto: UpdateTheaterDto) {
        return this.theaterService.update(id, updateTheaterDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.theaterService.remove(id);
    }
}
