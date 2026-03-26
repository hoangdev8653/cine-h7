import { IsNotEmpty, IsNumber, IsString, IsOptional, Min, Max, IsUUID } from 'class-validator';

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
