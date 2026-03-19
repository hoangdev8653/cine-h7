import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { OrderStatus } from './create-order.dto';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
    @IsOptional()
    @IsEnum(OrderStatus)
    status?: string;

    @IsOptional()
    @IsString()
    transaction_id?: string;

    @IsOptional()
    @IsDateString()
    paid_at?: Date;
}
