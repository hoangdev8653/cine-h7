import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';

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
    @IsObject()
    content?: any;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;
}
