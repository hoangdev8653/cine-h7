import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order } from './entities/order.entity';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { TicketModule } from '../ticket/ticket.module';
import { PaymentModule } from '../payment/payment.module';

@Module({
    imports: [TypeOrmModule.forFeature([Order]), AuthModule, UserModule, TicketModule, forwardRef(() => PaymentModule)],
    controllers: [OrderController],
    providers: [OrderService],
    exports: [OrderService],
})
export class OrderModule { }
