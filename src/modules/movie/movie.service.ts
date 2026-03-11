import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './entities/movie.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

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

    async getAllMovies(): Promise<Movie[]> {
        return await this.movieRepository.find();
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
