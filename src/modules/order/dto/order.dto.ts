import {
    IsNotEmpty,
    IsNumber,
    IsString,
    IsEnum,
    IsOptional,
    IsUUID,
    IsDateString,
    IsArray,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';


export enum OrderStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    CANCELLED = 'CANCELLED',
    EXPIRED = 'EXPIRED',
}

export enum PaymentMethod {
    VNPAY = 'vnpay',
    MOMO = 'momo',
    STRIPE = 'stripe',
}

export class CreateOrderDto {
    @IsNotEmpty()
    @IsUUID()
    showtimeId: string;

    @IsNotEmpty()
    @IsArray()
    @IsUUID('4', { each: true })
    seatIds: string[];

    @IsNotEmpty()
    @IsEnum(PaymentMethod)
    method: PaymentMethod;
}


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
