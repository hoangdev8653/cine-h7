import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';


export class CreateTheaterSystemDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    logo?: string;
}


export class UpdateTheaterSystemDto extends PartialType(CreateTheaterSystemDto) { }

