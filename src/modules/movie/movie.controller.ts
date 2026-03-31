import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseInterceptors, UploadedFiles, Query, Req } from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieDto, UpdateMovieDto } from './dto/movie.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { PaginationDto } from '../user/dto/user.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/role.guard';
import { Roles, UserRole } from '../../common/enum/user.enum';
import { UseGuards } from '@nestjs/common';

@Controller('movie')
export class MovieController {
    constructor(private readonly movieService: MovieService) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
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
    async getAllMovies(@Query() paginationDto: PaginationDto, @Req() req: any) {
        const hasQueryParams = Object.keys(req.query).length > 0;
        return await this.movieService.getAllMovies(paginationDto, hasQueryParams);
    }

    @Get(':id')
    async getMovieById(@Param('id', ParseUUIDPipe) id: string) {
        return await this.movieService.getMovieById(id);
    }

    @Get('slug/:slug')
    async getMovieBySlug(@Param('slug') slug: string) {
        return await this.movieService.getMovieBySlug(slug);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Patch(':id')
    async updateMovie(@Param('id', ParseUUIDPipe) id: string, @Body() updateMovieDto: UpdateMovieDto) {
        return await this.movieService.updateMovie(id, updateMovieDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Delete(':id')
    async deleteMovie(@Param('id', ParseUUIDPipe) id: string) {
        return await this.movieService.deleteMovie(id);
    }
}
