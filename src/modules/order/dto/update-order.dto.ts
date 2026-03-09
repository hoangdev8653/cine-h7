import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { PaymentStatus } from './create-order.dto';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
    @IsOptional()
    @IsEnum(PaymentStatus)
    payment_status?: string;

    @IsOptional()
    @IsString()
    transaction_id?: string;

    @IsOptional()
    @IsDateString()
    paid_at?: Date;
}
