import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Showtime } from '../showtime/entities/showtime.entity';
import { Seat } from '../seat/entities/seat.entity';
import { Ticket } from '../ticket/entities/ticket.entity';
import { PaymentService } from '../payment/payment.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @Inject(forwardRef(() => PaymentService))
    private readonly paymentService: PaymentService,
    private dataSource: DataSource,
  ) {}

  async createOrder(
    createOrderDto: CreateOrderDto,
    userId: string,
  ): Promise<Order> {
    const { showtimeId, seatIds } = createOrderDto;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const showtime = await queryRunner.manager.findOne(Showtime, {
        where: { id: showtimeId },
        relations: ['room'],
      });

      if (!showtime) {
        throw new NotFoundException('Không tìm thấy suất chiếu');
      }

      const seats = await queryRunner.manager.find(Seat, {
        where: { id: In(seatIds) },
      });

      if (seats.length !== seatIds.length) {
        throw new BadRequestException('Một hoặc nhiều ghế không tồn tại');
      }

      const invalidSeats = seats.filter(
        (seat) => seat.roomId !== showtime.roomId,
      );
      if (invalidSeats.length > 0) {
        throw new BadRequestException(
          'Một hoặc nhiều ghế không thuộc phòng chiếu này',
        );
      }

      const bookedTickets = await queryRunner.manager
        .createQueryBuilder(Ticket, 'ticket')
        .where('ticket.showtime_id = :showtimeId', { showtimeId })
        .andWhere('ticket.seat_id IN (:...seatIds)', { seatIds })
        .andWhere('ticket.status IN (:...statuses)', {
          statuses: ['HELD', 'BOOKED'],
        })
        .getMany();

      if (bookedTickets.length > 0) {
        throw new BadRequestException(
          'Một hoặc nhiều ghế đã được đặt hoặc đang giữ chỗ',
        );
      }

      const totalAmount = Number(showtime.price) * seats.length;

      const order = queryRunner.manager.create(Order, {
        userId,
        total_amount: totalAmount,
        status: 'PENDING',
        expire_at: new Date(Date.now() + 10 * 60 * 1000),
      });

      const savedOrder = await queryRunner.manager.save(order);
      console.log(savedOrder.id);

      const tickets = seats.map((seat) => {
        return queryRunner.manager.create(Ticket, {
          orderId: savedOrder.id,
          showtimeId,
          seatId: seat.id,
          seat_name: `${seat.row}${seat.column}`,
          price: showtime.price,
          status: 'HELD',
        });
      });

      const paymentURL = await this.paymentService.createVNPayUrl(
        savedOrder.id,
        totalAmount,
        '127.0.0.1',
      );
      console.log(paymentURL);

      await queryRunner.manager.save(Ticket, tickets);

      await queryRunner.commitTransaction();
      return savedOrder;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (
        err instanceof NotFoundException ||
        err instanceof BadRequestException
      ) {
        throw err;
      }
      throw new InternalServerErrorException(
        'Có lỗi xảy ra khi tạo đơn hàng: ' + err.message,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getAllOrders(): Promise<Order[]> {
    return await this.orderRepository.find({
      relations: ['user'],
      select: {
        user: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    });
  }

  async getOrderById(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['user'],
      select: {
        user: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async updateOrder(id: string, updateOrderDto: UpdateOrderDto) {
    const order = await this.getOrderById(id);
    Object.assign(order, updateOrderDto);
    return await this.orderRepository.save(order);
  }

  async deleteOrder(id: string) {
    const order = await this.getOrderById(id);
    await this.orderRepository.remove(order);
  }
}
