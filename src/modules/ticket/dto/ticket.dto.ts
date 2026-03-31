import { IsNotEmpty, IsUUID, IsString, IsNumber, Min, IsEnum } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';


export class CreateTicketDto {
    @IsNotEmpty()
    @IsUUID()
    orderId: string;

    @IsNotEmpty()
    @IsUUID()
    showtimeId: string;

    @IsNotEmpty()
    @IsUUID()
    seatId: string;

    @IsNotEmpty()
    @IsString()
    seat_name: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    price: number;

    @IsNotEmpty()
    @IsEnum(['HELD', 'BOOKED', 'CANCELLED'])
    status: string;
}


export class UpdateTicketDto extends PartialType(CreateTicketDto) { }
