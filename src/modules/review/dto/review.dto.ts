import { IsNotEmpty, IsNumber, IsString, IsOptional, Min, Max, IsUUID } from 'class-validator';
import { PartialType, OmitType } from '@nestjs/mapped-types';


export class CreateReviewDto {
    @IsNotEmpty()
    @IsUUID()
    movieId: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Max(10)
    rating: number;

    @IsOptional()
    @IsString()
    comment?: string;
}


export class UpdateReviewDto extends PartialType(OmitType(CreateReviewDto, ['movieId'] as const)) { }
