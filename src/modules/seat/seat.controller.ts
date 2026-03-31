import { Controller, Get, Param, Patch, Body, Query, UseGuards } from '@nestjs/common';
import { SeatService } from './seat.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/role.guard';
import { Roles, UserRole } from 'src/common/enum/user.enum';

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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/status')
  async updateSeatStatus(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return await this.seatService.updateSeatStatus(id, isActive);
  }
}
