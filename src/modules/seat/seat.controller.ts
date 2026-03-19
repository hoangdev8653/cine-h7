import { Controller, Get, Param, Patch, Body, Query } from '@nestjs/common';
import { SeatService } from './seat.service';

@Controller('seat')
export class SeatController {
  constructor(private readonly seatService: SeatService) { }

  @Get('room/:roomId')
  async getAllSeatsByRoom(
    @Param('roomId') roomId: string,
    @Query('showtimeId') showtimeId?: string,
  ) {
    return await this.seatService.getAllSeatsByRoom(roomId, showtimeId);
  }

  @Get('showtime/:showtimeId')
  async getAllSeatsByShowtime(@Param('showtimeId') showtimeId: string) {
    return await this.seatService.getAllSeatsByShowtime(showtimeId);
  }

  @Get(':id')
  async getSeatById(@Param('id') id: string) {
    return await this.seatService.getSeatById(id);
  }

  @Patch(':id/status')
  async updateSeatStatus(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return await this.seatService.updateSeatStatus(id, isActive);
  }
}
