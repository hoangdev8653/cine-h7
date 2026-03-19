import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskService } from './schedule.service';
import { Order } from '../order/entities/order.entity'
import { Ticket } from '../ticket/entities/ticket.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Order, Ticket])],
    providers: [TaskService],
    exports: [TaskService],
})
export class TasksModule { }
