import { Controller, Get, Param, Patch, Body } from '@nestjs/common';
import { SeatService } from './seat.service';

@Controller('seat')
export class SeatController {
  constructor(private readonly seatService: SeatService) {}

  @Get('room/:roomId')
  async getAllSeatsByRoom(@Param('roomId') roomId: string) {
    return await this.seatService.getAllSeatsByRoom(roomId);
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
