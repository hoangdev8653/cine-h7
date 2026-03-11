import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Seat } from './entities/seat.entity';

@Injectable()
export class SeatService {
  constructor(
    @InjectRepository(Seat)
    private readonly seatRepository: Repository<Seat>,
  ) {}

  async getAllSeatsByRoom(roomId: string): Promise<Seat[]> {
    return await this.seatRepository.find({
      where: { roomId },
      order: { row: 'ASC', column: 'ASC' },
    });
  }

  async getSeatById(id: string): Promise<Seat> {
    const seat = await this.seatRepository.findOne({
      where: { id },
      relations: ['room'],
    });
    if (!seat) {
      throw new NotFoundException(`Seat with ID ${id} not found`);
    }
    return seat;
  }

  async updateSeatStatus(id: string, isActive: boolean): Promise<Seat> {
    const seat = await this.getSeatById(id);
    seat.isActive = isActive;
    return await this.seatRepository.save(seat);
  }
}
