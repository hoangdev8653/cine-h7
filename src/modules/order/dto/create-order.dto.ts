import { IsNotEmpty, IsNumber, IsString, IsEnum, IsOptional, IsUUID, IsDateString } from 'class-validator';

export enum PaymentStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    CANCELLED = 'CANCELLED',
    EXPIRED = 'EXPIRED',
}

export enum PaymentMethod {
    VNPAY = 'VNPAY',
    MOMO = 'MOMO',
    STRIPE = 'STRIPE',
}

export class CreateOrderDto {
    @IsNotEmpty()
    @IsUUID()
    userId: string;

    @IsNotEmpty()
    @IsNumber()
    total_amount: number;

    @IsOptional()
    @IsEnum(PaymentMethod)
    payment_method?: string;

    @IsOptional()
    @IsDateString()
    expire_at?: Date;
}
