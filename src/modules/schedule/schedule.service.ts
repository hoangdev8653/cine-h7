import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from '../order/entities/order.entity';
import { In, LessThan, Repository } from 'typeorm';
import { Ticket } from '../ticket/entities/ticket.entity';

@Injectable()
export class TaskService {
    constructor(
        @InjectRepository(Order)
        private orderRespository: Repository<Order>,
        @InjectRepository(Ticket)
        private ticketRespository: Repository<Ticket>
    ) { }

    private readonly logger = new Logger(TaskService.name);
    @Cron(CronExpression.EVERY_10_MINUTES)
    async handleCheckExpiredOrder() {
        const now = new Date();
        const expiredOrders = await this.orderRespository.find({
            where: {
                expire_at: LessThan(now),
                status: 'PENDING'
            }
        })
        if (expiredOrders.length === 0) {
            console.log('Không có đơn hàng hết hạn ✅');
            return;
        }
        const updateStatusOrder = await this.orderRespository.update(expiredOrders.map(order => order.id), { status: 'EXPIRED' });
        console.log(`Đã cập nhật ${updateStatusOrder.affected} đơn hàng hết hạn ✅`);
        const orderIds = expiredOrders.map(order => order.id);
        const expiredTickets = await this.ticketRespository.find({
            where: {
                orderId: In(orderIds),
                status: 'HELD'
            }
        });
        if (expiredTickets.length > 0) {
            const ticketIds = expiredTickets.map(ticket => ticket.id);
            await this.ticketRespository.update(ticketIds, { status: 'CANCELLED' });
            this.logger.log(`Đã hủy ${expiredTickets.length} vé ✅`);
        }
    }
}