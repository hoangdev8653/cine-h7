import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateTheaterSystemDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    logo?: string;
}
