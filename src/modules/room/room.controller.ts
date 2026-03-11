import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) { }

  @Post()
  async createRoom(@Body() createRoomDto: CreateRoomDto) {
    return await this.roomService.createRoom(createRoomDto);
  }

  @Get()
  async getAllRooms() {
    return await this.roomService.getAllRooms();
  }

  @Get(':id')
  async getRoomById(@Param('id') id: string) {
    return await this.roomService.getRoomById(id);
  }

  @Patch(':id')
  async updateRoom(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return await this.roomService.updateRoom(id, updateRoomDto);
  }

  @Delete(':id')
  async deleteRoom(@Param('id') id: string) {
    return await this.roomService.deleteRoom(id);
  }
}
