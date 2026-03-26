import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Seat } from './entities/seat.entity';
import { Showtime } from '../showtime/entities/showtime.entity';
import { Ticket } from '../ticket/entities/ticket.entity';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class SeatService {
  constructor(
    @InjectRepository(Seat)
    private readonly seatRepository: Repository<Seat>,
    @InjectRepository(Showtime)
    private readonly showtimeRepository: Repository<Showtime>,
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    private readonly redisService: RedisService,
  ) { }

  async getAllSeatsByRoom(roomId: string, showtimeId?: string) {
    const seats = await this.seatRepository.find({
      where: { roomId },
      order: { row: 'ASC', column: 'ASC' },
    });

    if (!showtimeId) return seats;

    const bookedTickets = await this.ticketRepository.find({
      where: {
        showtimeId,
        status: In(['HELD', 'BOOKED']),
      },
      select: ['seatId'],
    });
    const bookedSeatIds = new Set(bookedTickets.map((t) => t.seatId));

    const lockKeys = await this.redisService.getKeys(`seat_lock:${showtimeId}:*`);
    const lockedSeatIds = new Set(lockKeys.map((key) => key.split(':').pop()));

    return seats.map((seat) => ({
      ...seat,
      isBooked: bookedSeatIds.has(seat.id),
      isLocking: lockedSeatIds.has(seat.id),
    }));
  }

  async getAllSeatsByShowtime(showtimeId: string) {
    const showtime = await this.showtimeRepository.findOne({ where: { id: showtimeId } });
    if (!showtime) {
      throw new NotFoundException(`Showtime with ID ${showtimeId} not found`);
    }

    const seats = await this.seatRepository.find({
      where: { roomId: showtime.roomId },
      order: { row: 'ASC', column: 'ASC' },
    });

    const bookedTickets = await this.ticketRepository.find({
      where: {
        showtimeId,
        status: In(['HELD', 'BOOKED']),
      },
      select: ['seatId'],
    });
    const bookedSeatIds = new Set(bookedTickets.map((t) => t.seatId));

    const lockKeys = await this.redisService.getKeys(`seat_lock:${showtimeId}:*`);
    const lockedSeatIds = new Set(lockKeys.map((key) => key.split(':').pop()));

    return seats.map((seat) => ({
      ...seat,
      isBooked: bookedSeatIds.has(seat.id),
      isLocking: lockedSeatIds.has(seat.id),
    }));
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
