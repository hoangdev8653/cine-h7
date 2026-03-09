import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
    ) { }

    async create(createOrderDto: CreateOrderDto): Promise<Order> {
        const order = this.orderRepository.create(createOrderDto);
        return await this.orderRepository.save(order);
    }

    async findAll(): Promise<Order[]> {
        return await this.orderRepository.find({ relations: ['user'] });
    }

    async findOne(id: string): Promise<Order> {
        const order = await this.orderRepository.findOne({
            where: { id },
            relations: ['user'],
        });
        if (!order) {
            throw new NotFoundException(`Order with ID ${id} not found`);
        }
        return order;
    }

    async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
        const order = await this.findOne(id);
        Object.assign(order, updateOrderDto);
        return await this.orderRepository.save(order);
    }

    async remove(id: string): Promise<void> {
        const order = await this.findOne(id);
        await this.orderRepository.remove(order);
    }
}
