import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewService {
    constructor(
        @InjectRepository(Review)
        private readonly reviewRepository: Repository<Review>,
    ) { }

    async createReview(userId: string, createReviewDto: CreateReviewDto) {
        const existingReview = await this.reviewRepository.findOne({
            where: { user: { id: userId }, movie: { id: createReviewDto.movieId } }
        });

        if (existingReview) {
            throw new BadRequestException('You have already reviewed this movie');
        }

        const review = this.reviewRepository.create({
            ...createReviewDto,
            user: { id: userId },
            movie: { id: createReviewDto.movieId }
        });

        return this.reviewRepository.save(review);
    }

    async getAllReview() {
        return this.reviewRepository.find({
            relations: ['user', "movie"],
            select: {
                id: true,
                rating: true,
                comment: true,
                created_at: true,
                updated_at: true,
                user: {
                    id: true,
                    name: true,
                    avatar: true
                }
            },
            order: { created_at: 'DESC' }
        });
    }

    async getReviewByMovie(movieId: string, page: number = 1, limit: number = 10) {
        const [data, total] = await this.reviewRepository.findAndCount({
            where: { movie: { id: movieId } },
            relations: ['user', "movie"],
            select: {
                id: true,
                rating: true,
                comment: true,
                created_at: true,
                updated_at: true,
                user: {
                    id: true,
                    name: true,
                    avatar: true
                }
            },
            skip: (page - 1) * limit,
            take: limit,
            order: { created_at: 'DESC' }
        });

        return {
            data,
            total,
            page,
            last_page: Math.ceil(total / limit) || 1
        };
    }

    async updateReview(id: string, userId: string, updateReviewDto: UpdateReviewDto) {
        const review = await this.reviewRepository.findOne({ where: { id, user: { id: userId } } });

        if (!review) {
            throw new NotFoundException('Review not found or you are not authorized to update it');
        }

        Object.assign(review, updateReviewDto);
        return this.reviewRepository.save(review);
    }

    async deleteReview(id: string) {
        const review = await this.reviewRepository.findOne({ where: { id } });
        if (!review) {
            throw new NotFoundException('Review not found');
        }
        return this.reviewRepository.remove(review);
    }
}
