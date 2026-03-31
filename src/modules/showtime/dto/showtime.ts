import { IsNotEmpty, IsUUID, IsDateString, IsNumber, Min } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';


export class CreateShowtimeDto {
    @IsNotEmpty()
    @IsUUID()
    movieId: string;

    @IsNotEmpty()
    @IsUUID()
    roomId: string;

    @IsNotEmpty()
    @IsDateString()
    startTime: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    price: number;
}


export class UpdateShowtimeDto extends PartialType(CreateShowtimeDto) { }

