import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Room } from './entities/room.entity';
import { CreateRoomDto, UpdateRoomDto } from './dto/room';
import { Seat } from '../seat/entities/seat.entity';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(Seat)
    private readonly seatRepository: Repository<Seat>,
    private dataSource: DataSource,
  ) { }

  async createRoom(createRoomDto: CreateRoomDto): Promise<Room> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const room = this.roomRepository.create(createRoomDto);
      const savedRoom = await queryRunner.manager.save(Room, room);

      const seats: Seat[] = [];
      const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

      for (const row of rows) {
        for (let col = 1; col <= 10; col++) {
          const seat = this.seatRepository.create({
            roomId: savedRoom.id,
            row: row,
            column: col,
            type: 'STANDARD',
            isActive: true,
          });
          seats.push(seat);
        }
      }

      await queryRunner.manager.save(Seat, seats);
      await queryRunner.commitTransaction();

      return savedRoom;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getAllRooms(): Promise<Room[]> {
    return await this.roomRepository.find({
      relations: ['theater'],
    });
  }

  async getRoomById(id: string): Promise<Room> {
    const room = await this.roomRepository.findOne({
      where: { id },
      relations: ['theater', 'seats'],
    });
    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }
    return room;
  }

  async updateRoom(id: string, updateRoomDto: UpdateRoomDto): Promise<Room> {
    const room = await this.getRoomById(id);
    const updatedRoom = Object.assign(room, updateRoomDto);
    return await this.roomRepository.save(updatedRoom);
  }

  async deleteRoom(id: string): Promise<void> {
    const room = await this.getRoomById(id);
    await this.roomRepository.remove(room);
  }
}
