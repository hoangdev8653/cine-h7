import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ShowtimeService } from './showtime.service';
import { CreateShowtimeDto } from './dto/create-showtime.dto';
import { UpdateShowtimeDto } from './dto/update-showtime.dto';

@Controller('showtime')
export class ShowtimeController {
  constructor(private readonly showtimeService: ShowtimeService) {}

  @Post()
  async createShowtime(@Body() createShowtimeDto: CreateShowtimeDto) {
    return await this.showtimeService.createShowtime(createShowtimeDto);
  }

  @Get()
  async getAllShowtimes() {
    return await this.showtimeService.getAllShowtimes();
  }

  @Get('/movie/:movieId')
  async getShowtimeByMovie(@Param('movieId') movieId: string) {
    return await this.showtimeService.getShowtimeByMovie(movieId);
  }

  @Get(':id')
  async getShowtimeById(@Param('id') id: string) {
    return await this.showtimeService.getShowtimeById(id);
  }

  @Patch(':id')
  async updateShowtime(
    @Param('id') id: string,
    @Body() updateShowtimeDto: UpdateShowtimeDto,
  ) {
    return await this.showtimeService.updateShowtime(id, updateShowtimeDto);
  }

  @Delete(':id')
  async deleteShowtime(@Param('id') id: string) {
    return await this.showtimeService.deleteShowtime(id);
  }
}
