import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';


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

export class UpdateTheaterDto extends PartialType(CreateTheaterDto) { }

