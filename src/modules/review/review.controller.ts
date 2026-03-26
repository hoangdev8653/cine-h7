import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';

@Controller('review')
export class ReviewController {
    constructor(private readonly reviewService: ReviewService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    async createReview(@Req() req: { user: { id: string } }, @Body() createReviewDto: CreateReviewDto) {
        const userId = req.user.id;
        return await this.reviewService.createReview(userId, createReviewDto);
    }

    @Get()
    async getAllReview() {
        return await this.reviewService.getAllReview();
    }

    @Get('movie/:movieId')
    async getReviewByMovie(
        @Param('movieId') movieId: string,
        @Query('page') page: string,
        @Query('limit') limit: string
    ) {
        return await this.reviewService.getReviewByMovie(movieId, page ? +page : 1, limit ? +limit : 10);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    async updateReview(@Param('id') id: string, @Req() req: any, @Body() updateReviewDto: UpdateReviewDto) {
        return await this.reviewService.updateReview(id, req.user.id, updateReviewDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async deleteReview(@Param('id') id: string) {
        return await this.reviewService.deleteReview(id);
    }
}
