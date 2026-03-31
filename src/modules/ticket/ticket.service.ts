import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { CreateTicketDto, UpdateTicketDto } from './dto/ticket.dto';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
  ) { }

  async createTicket(createTicketDto: CreateTicketDto): Promise<Ticket> {
    const ticket = this.ticketRepository.create(createTicketDto);
    return await this.ticketRepository.save(ticket);
  }

  async getAllTickets(): Promise<Ticket[]> {
    return await this.ticketRepository.find({
      relations: ['order', 'showtime', 'seat'],
    });
  }

  async getTicketById(id: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: ['order', 'showtime', 'seat'],
    });
    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }
    return ticket;
  }

  async getTicketsByOrder(orderId: string): Promise<Ticket[]> {
    return await this.ticketRepository.find({
      where: { orderId },
      relations: ['showtime', 'seat'],
    });
  }

  async updateTicket(id: string, updateTicketDto: UpdateTicketDto): Promise<Ticket> {
    const ticket = await this.getTicketById(id);
    const updatedTicket = Object.assign(ticket, updateTicketDto);
    return await this.ticketRepository.save(updatedTicket);
  }

  async deleteTicket(id: string): Promise<void> {
    const ticket = await this.getTicketById(id);
    await this.ticketRepository.remove(ticket);
  }
}
