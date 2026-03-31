import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto, UpdateTicketDto } from './dto/ticket.dto';

@Controller('ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) { }

  @Post()
  async createTicket(@Body() createTicketDto: CreateTicketDto) {
    return await this.ticketService.createTicket(createTicketDto);
  }

  @Get()
  async getAllTickets() {
    return await this.ticketService.getAllTickets();
  }

  @Get(':id')
  async getTicketById(@Param('id', ParseUUIDPipe) id: string) {
    return await this.ticketService.getTicketById(id);
  }

  @Get('order/:orderId')
  async getTicketsByOrder(@Param('orderId', ParseUUIDPipe) orderId: string) {
    return await this.ticketService.getTicketsByOrder(orderId);
  }

  @Patch(':id')
  async updateTicket(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTicketDto: UpdateTicketDto,
  ) {
    return await this.ticketService.updateTicket(id, updateTicketDto);
  }

  @Delete(':id')
  async deleteTicket(@Param('id', ParseUUIDPipe) id: string) {
    return await this.ticketService.deleteTicket(id);
  }
}
