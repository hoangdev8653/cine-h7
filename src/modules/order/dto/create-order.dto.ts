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
