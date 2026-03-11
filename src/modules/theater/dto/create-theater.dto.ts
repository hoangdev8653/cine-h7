import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateTheaterDto {
    @IsNotEmpty()
    @IsUUID()
    systemId: string;

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    logo?: string;
}
