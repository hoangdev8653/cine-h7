import { IsNotEmpty, IsString, IsEnum, IsOptional, IsInt, Min, IsUUID } from 'class-validator';

export class CreateRoomDto {
    @IsNotEmpty()
    @IsUUID()
    theaterId: string;

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsEnum(['2D', '3D', 'IMAX', 'GOLD CLASS'])
    type?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    total_seats?: number;
}
