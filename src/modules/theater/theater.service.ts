import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Theater } from './entities/theater.entity';
import { CreateTheaterDto } from './dto/create-theater.dto';
import { UpdateTheaterDto } from './dto/update-theater.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';


@Injectable()
export class TheaterService {
    constructor(
        @InjectRepository(Theater)
        private readonly theaterRepository: Repository<Theater>,
        private readonly cloudinaryService: CloudinaryService,
    ) { }

    async createTheater(createTheaterDto: CreateTheaterDto, file?: Express.Multer.File): Promise<Theater> {
        if (file) {
            const result = await this.cloudinaryService.uploadFile(file);
            createTheaterDto.logo = result.secure_url;
        }
        const theater = this.theaterRepository.create(createTheaterDto);
        return await this.theaterRepository.save(theater);
    }

    async getAllTheaters(): Promise<Theater[]> {
        return await this.theaterRepository.find({ relations: ['system'] });
    }

    async getTheaterById(id: string): Promise<Theater> {
        const theater = await this.theaterRepository.findOne({
            where: { id },
            relations: ['system'],
        });
        if (!theater) {
            throw new NotFoundException(`Theater with ID ${id} not found`);
        }
        return theater;
    }

    async updateTheater(id: string, updateTheaterDto: UpdateTheaterDto, file?: Express.Multer.File): Promise<Theater> {
        const theater = await this.getTheaterById(id);
        if (file) {
            const result = await this.cloudinaryService.uploadFile(file);
            updateTheaterDto.logo = result.secure_url;
        }
        Object.assign(theater, updateTheaterDto);
        return await this.theaterRepository.save(theater);
    }

    async deleteTheater(id: string): Promise<void> {
        const theater = await this.getTheaterById(id);
        await this.theaterRepository.remove(theater);
    }
}
