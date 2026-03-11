import { IsNotEmpty, IsUUID, IsDateString, IsNumber, Min } from 'class-validator';

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
