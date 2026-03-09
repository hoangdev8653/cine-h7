import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Theater } from './entities/theater.entity';
import { CreateTheaterDto } from './dto/create-theater.dto';
import { UpdateTheaterDto } from './dto/update-theater.dto';

@Injectable()
export class TheaterService {
    constructor(
        @InjectRepository(Theater)
        private readonly theaterRepository: Repository<Theater>,
    ) { }

    async create(createTheaterDto: CreateTheaterDto): Promise<Theater> {
        const theater = this.theaterRepository.create(createTheaterDto);
        return await this.theaterRepository.save(theater);
    }

    async findAll(): Promise<Theater[]> {
        return await this.theaterRepository.find({ relations: ['system'] });
    }

    async findOne(id: number): Promise<Theater> {
        const theater = await this.theaterRepository.findOne({
            where: { id },
            relations: ['system'],
        });
        if (!theater) {
            throw new NotFoundException(`Theater with ID ${id} not found`);
        }
        return theater;
    }

    async update(id: number, updateTheaterDto: UpdateTheaterDto): Promise<Theater> {
        const theater = await this.findOne(id);
        Object.assign(theater, updateTheaterDto);
        return await this.theaterRepository.save(theater);
    }

    async remove(id: number): Promise<void> {
        const theater = await this.findOne(id);
        await this.theaterRepository.remove(theater);
    }
}
