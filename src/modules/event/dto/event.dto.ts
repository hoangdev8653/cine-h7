import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';
import { BadRequestException } from '@nestjs/common';
import { Transform } from 'class-transformer';
import type { EventContent } from '../entities/event.entity';
import { PartialType } from '@nestjs/mapped-types';


export class CreateEventDto {
    @IsNotEmpty()
    @IsString()
    type: string;

    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    slug: string;

    @IsOptional()
    @IsString()
    thumbnail?: string;

    @IsOptional()
    @Transform(({ value, key }) => {
        if (typeof value !== 'string') return value;
        try {
            return JSON.parse(value);
        } catch (e) {
            throw new BadRequestException(`${key} must be a valid JSON string`);
        }
    })
    @IsObject()
    content?: EventContent;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;
}


export class UpdateEventDto extends PartialType(CreateEventDto) { }
