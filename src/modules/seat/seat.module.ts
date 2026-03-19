import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Seat } from './entities/seat.entity';
import { Showtime } from '../showtime/entities/showtime.entity';
import { Ticket } from '../ticket/entities/ticket.entity';
import { SeatService } from './seat.service';
import { SeatController } from './seat.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Seat, Showtime, Ticket])],
  controllers: [SeatController],
  providers: [SeatService],
  exports: [SeatService, TypeOrmModule],
})
export class SeatModule {}
