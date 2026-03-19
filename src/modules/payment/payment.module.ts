import { Module, forwardRef } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { OrderModule } from '../order/order.module'; // Để sau này cập nhật trạng thái
@Module({
  imports: [forwardRef(() => OrderModule)], // Nếu cần gọi tới OrderService
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
