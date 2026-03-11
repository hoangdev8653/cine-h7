import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('movie')
export class MovieController {
    constructor(private readonly movieService: MovieService) { }

    @Post()
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'poster', maxCount: 1 },
        { name: 'trailer', maxCount: 1 },
    ]))
    async createMovie(
        @Body() createMovieDto: CreateMovieDto,
        @UploadedFiles() files: { poster?: Express.Multer.File[], trailer?: Express.Multer.File[] },
    ) {
        const poster = files?.poster?.[0];
        const trailer = files?.trailer?.[0];
        return await this.movieService.createMovie(createMovieDto, poster, trailer);
    }

    @Get()
    async getAllMovies() {
        return await this.movieService.getAllMovies();
    }

    @Get(':id')
    async getMovieById(@Param('id', ParseUUIDPipe) id: string) {
        return await this.movieService.getMovieById(id);
    }

    @Get('slug/:slug')
    async getMovieBySlug(@Param('slug') slug: string) {
        return await this.movieService.getMovieBySlug(slug);
    }

    @Patch(':id')
    async updateMovie(@Param('id', ParseUUIDPipe) id: string, @Body() updateMovieDto: UpdateMovieDto) {
        return await this.movieService.updateMovie(id, updateMovieDto);
    }

    @Delete(':id')
    async deleteMovie(@Param('id', ParseUUIDPipe) id: string) {
        return await this.movieService.deleteMovie(id);
    }
}
