import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { OrderService } from './order.service';
import { CreateOrderDto, UpdateOrderDto } from './dto/order.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { PaginationDto } from '../user/dto/user.dto';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 2, ttl: 60000 } })
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @Req() req: { user: { id: string } },
  ) {
    const userId = req.user.id;
    return await this.orderService.createOrder(createOrderDto, userId);
  }

  @Get()
  async getAllOrders(@Query() paginationDto: PaginationDto, @Req() req: any) {
    const hasQueryParams = Object.keys(req.query).length > 0;
    return await this.orderService.getAllOrders(paginationDto, hasQueryParams);
  }

  @Get('getOrderByUser')
  @UseGuards(JwtAuthGuard)
  async getOrdersByUserId(@Req() req: { user: { id: string } }) {
    const userId = req.user.id;
    return await this.orderService.getOrdersByUserId(userId);
  }

  @Get(':id')
  async getOrderById(@Param('id', ParseUUIDPipe) id: string) {
    return await this.orderService.getOrderById(id);
  }

  @Patch(':id')
  async updateOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return await this.orderService.updateOrder(id, updateOrderDto);
  }

  @Delete(':id')
  async deleteOrder(@Param('id', ParseUUIDPipe) id: string) {
    return await this.orderService.deleteOrder(id);
  }
}
