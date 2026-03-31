import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Movie } from './entities/movie.entity';
import { CreateMovieDto, UpdateMovieDto } from './dto/movie.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PaginationDto } from '../user/dto/user.dto';
import { pagination } from 'src/utils/pagination';

@Injectable()
export class MovieService {
    constructor(
        @InjectRepository(Movie)
        private readonly movieRepository: Repository<Movie>,
        private readonly cloudinaryService: CloudinaryService,
    ) { }

    async createMovie(createMovieDto: CreateMovieDto, poster?: Express.Multer.File, trailer?: Express.Multer.File): Promise<Movie> {
        const movie = this.movieRepository.create(createMovieDto);
        if (poster) {
            const result = await this.cloudinaryService.uploadFile(poster);
            movie.poster = result.secure_url;
        }
        if (trailer) {
            const result = await this.cloudinaryService.uploadFile(trailer);
            movie.trailer = result.secure_url;
        }
        return await this.movieRepository.save(movie);
    }

    async getAllMovies(paginationDto: PaginationDto, hasQueryParams: boolean = true) {
        const { skip, take, page, limit } = pagination(paginationDto.page ?? 1, paginationDto.limit ?? 10);
        const search = paginationDto.search;
        if (hasQueryParams) {
            const [movie, total] = await this.movieRepository.findAndCount({
                skip,
                take,
                where: search ? {
                    title: ILike(`%${search}%`),
                } : {},
                order: { created_at: 'DESC' },
            });
            return { movie, total, page, limit, totalPages: Math.ceil(total / limit) };
        } else {
            const movie = await this.movieRepository.find({
                order: { created_at: 'DESC' },
            });
            return { movie };
        }
    }

    async getMovieById(id: string): Promise<Movie> {
        const movie = await this.movieRepository.findOne({ where: { id } });
        if (!movie) {
            throw new NotFoundException(`Movie with ID ${id} not found`);
        }
        return movie;
    }

    async getMovieBySlug(slug: string): Promise<Movie> {
        const movie = await this.movieRepository.findOne({ where: { slug } });
        if (!movie) {
            throw new NotFoundException(`Movie with slug ${slug} not found`);
        }
        return movie;
    }

    async updateMovie(id: string, updateMovieDto: UpdateMovieDto): Promise<Movie> {
        const movie = await this.getMovieById(id);
        Object.assign(movie, updateMovieDto);
        return await this.movieRepository.save(movie);
    }

    async deleteMovie(id: string): Promise<void> {
        const movie = await this.getMovieById(id);
        await this.movieRepository.remove(movie);
    }
}
