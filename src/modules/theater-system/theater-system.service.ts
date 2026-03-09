import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TheaterSystem } from './entities/theater-system.entity';
import { CreateTheaterSystemDto } from './dto/create-theater-system.dto';
import { UpdateTheaterSystemDto } from './dto/update-theater-system.dto';

@Injectable()
export class TheaterSystemService {
    constructor(
        @InjectRepository(TheaterSystem)
        private readonly theaterSystemRepository: Repository<TheaterSystem>,
    ) { }

    async create(createTheaterSystemDto: CreateTheaterSystemDto): Promise<TheaterSystem> {
        const theaterSystem = this.theaterSystemRepository.create(createTheaterSystemDto);
        return await this.theaterSystemRepository.save(theaterSystem);
    }

    async findAll(): Promise<TheaterSystem[]> {
        return await this.theaterSystemRepository.find();
    }

    async findOne(id: number): Promise<TheaterSystem> {
        const theaterSystem = await this.theaterSystemRepository.findOne({ where: { id } });
        if (!theaterSystem) {
            throw new NotFoundException(`TheaterSystem with ID ${id} not found`);
        }
        return theaterSystem;
    }

    async update(id: number, updateTheaterSystemDto: UpdateTheaterSystemDto): Promise<TheaterSystem> {
        const theaterSystem = await this.findOne(id);
        Object.assign(theaterSystem, updateTheaterSystemDto);
        return await this.theaterSystemRepository.save(theaterSystem);
    }

    async remove(id: number): Promise<void> {
        const theaterSystem = await this.findOne(id);
        await this.theaterSystemRepository.remove(theaterSystem);
    }
}
