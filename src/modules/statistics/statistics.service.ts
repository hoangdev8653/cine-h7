import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Order } from '../order/entities/order.entity';
import { Ticket } from '../ticket/entities/ticket.entity';

type Period = 'daily' | 'weekly' | 'monthly';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
  ) { }

  async getOverview() {
    const users = await this.userRepository.count();
    const orders = await this.orderRepository.count();
    const tickets = await this.ticketRepository.count();
    const revenue = await this.ticketRepository.sum('price');
    return {
      users,
      orders,
      tickets,
      revenue,
    };
  }

  async getRevenue(period: Period = 'monthly') {
    const format = this.getDateFormat(period);

    const rows = await this.orderRepository
      .createQueryBuilder('order')
      .select(`TO_CHAR(order.paid_at, '${format}')`, 'label')
      .addSelect('COALESCE(SUM(order.total_amount), 0)', 'revenue')
      .addSelect('COUNT(order.id)', 'total_orders')
      .where('order.status = :status', { status: 'PAID' })
      .andWhere('order.paid_at IS NOT NULL')
      .groupBy(`TO_CHAR(order.paid_at, '${format}')`)
      .orderBy(`TO_CHAR(order.paid_at, '${format}')`, 'ASC')
      .getRawMany();

    return rows.map((r) => ({
      label: r.label,
      revenue: Number(r.revenue),
      totalOrders: Number(r.total_orders),
    }));
  }

  async getTopMovies(limit: number = 5) {
    const rows = await this.ticketRepository
      .createQueryBuilder('t')
      .select('m.id', 'movie_id')
      .addSelect('m.title', 'title')
      .addSelect('m.poster', 'poster')
      .addSelect('COUNT(t.id)', 'tickets_sold')
      .addSelect('COALESCE(SUM(t.price), 0)', 'revenue')
      .innerJoin('t.showtime', 's')
      .innerJoin('s.movie', 'm')
      .where('t.status = :status', { status: 'BOOKED' })
      .groupBy('m.id')
      .addGroupBy('m.title')
      .addGroupBy('m.poster')
      .orderBy('COUNT(t.id)', 'DESC')
      .limit(limit)
      .getRawMany();

    return rows.map((r) => ({
      movieId: r.movie_id,
      title: r.title,
      poster: r.poster,
      ticketsSold: Number(r.tickets_sold),
      revenue: Number(r.revenue),
    }));
  }

  async getOrders(period: Period = 'monthly') {
    const format = this.getDateFormat(period);

    const rows = await this.orderRepository
      .createQueryBuilder('order')
      .select(`TO_CHAR(order.created_at, '${format}')`, 'label')
      .addSelect('COUNT(*)', 'total')
      .addSelect("SUM(CASE WHEN order.status = 'PAID' THEN 1 ELSE 0 END)", 'paid')
      .addSelect("SUM(CASE WHEN order.status = 'CANCELLED' THEN 1 ELSE 0 END)", 'cancelled')
      .addSelect("SUM(CASE WHEN order.status = 'EXPIRED' THEN 1 ELSE 0 END)", 'expired')
      .groupBy(`TO_CHAR(order.created_at, '${format}')`)
      .orderBy(`TO_CHAR(order.created_at, '${format}')`, 'ASC')
      .getRawMany();

    return rows.map((r) => ({
      label: r.label,
      total: Number(r.total),
      paid: Number(r.paid),
      cancelled: Number(r.cancelled),
      expired: Number(r.expired),
    }));
  }

  private getDateFormat(period: Period): string {
    switch (period) {
      case 'daily':   return 'YYYY-MM-DD';
      case 'weekly':  return 'IYYY-IW';
      case 'monthly': return 'YYYY-MM';
    }
  }
}
