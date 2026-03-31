import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ShowtimeService } from './showtime.service';
import { CreateShowtimeDto, UpdateShowtimeDto } from './dto/showtime';
import { PaginationDto } from '../user/dto/user.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/role.guard';
import { Roles, UserRole } from 'src/common/enum/user.enum';

@Controller('showtime')
export class ShowtimeController {
  constructor(private readonly showtimeService: ShowtimeService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  async createShowtime(@Body() createShowtimeDto: CreateShowtimeDto) {
    return await this.showtimeService.createShowtime(createShowtimeDto);
  }

  @Get()
  async getAllShowtimes(@Query() paginationDto: PaginationDto) {
    return await this.showtimeService.getAllShowtimes(paginationDto);
  }

  @Get('/movie/:movieId')
  async getShowtimeByMovie(@Param('movieId') movieId: string) {
    return await this.showtimeService.getShowtimeByMovie(movieId);
  }

  @Get(':id')
  async getShowtimeById(@Param('id') id: string) {
    return await this.showtimeService.getShowtimeById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  async updateShowtime(
    @Param('id') id: string,
    @Body() updateShowtimeDto: UpdateShowtimeDto,
  ) {
    return await this.showtimeService.updateShowtime(id, updateShowtimeDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async deleteShowtime(@Param('id') id: string) {
    return await this.showtimeService.deleteShowtime(id);
  }
}
