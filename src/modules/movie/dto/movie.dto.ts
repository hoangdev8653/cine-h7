import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsInt, IsDateString } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';



export class CreateMovieDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    slug: string;

    @IsOptional()
    @IsString()
    trailer?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsDateString()
    releaseDate?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    rating?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    duration?: number;

    @IsOptional()
    @IsString()
    poster?: string;

    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    comingSoon?: boolean;

    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    isShowing?: boolean;
}


export class UpdateMovieDto extends PartialType(CreateMovieDto) { }
