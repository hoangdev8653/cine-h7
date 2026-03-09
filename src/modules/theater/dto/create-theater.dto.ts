import { IsNotEmpty, IsString, IsOptional, IsInt } from 'class-validator';

export class CreateTheaterDto {
    @IsNotEmpty()
    @IsInt()
    systemId: number;

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    address?: string;
}
