import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TheaterSystem } from './entities/theater-system.entity';
import { CreateTheaterSystemDto } from './dto/create-theater-system.dto';
import { UpdateTheaterSystemDto } from './dto/update-theater-system.dto';
import { CloudinaryService } from "../cloudinary/cloudinary.service"

@Injectable()
export class TheaterSystemService {
    constructor(
        @InjectRepository(TheaterSystem)
        private readonly theaterSystemRepository: Repository<TheaterSystem>,
        private readonly cloudinaryService: CloudinaryService,
    ) { }

    async createTheaterSystem(createTheaterSystemDto: CreateTheaterSystemDto, file?: Express.Multer.File) {
        if (file) {
            const result = await this.cloudinaryService.uploadFile(file);
            createTheaterSystemDto.logo = result.secure_url;
        }
        const theaterSystem = this.theaterSystemRepository.create(createTheaterSystemDto);
        return await this.theaterSystemRepository.save(theaterSystem);
    }

    async getAllTheaterSystems(): Promise<TheaterSystem[]> {
        return await this.theaterSystemRepository.find();
    }

    async getTheaterSystemById(id: string) {
        const theaterSystem = await this.theaterSystemRepository.findOne({ where: { id } });
        if (!theaterSystem) {
            throw new NotFoundException(`TheaterSystem with ID ${id} not found`);
        }
        return theaterSystem;
    }

    async updateTheaterSystem(id: string, updateTheaterSystemDto: UpdateTheaterSystemDto) {
        const theaterSystem = await this.theaterSystemRepository.findOne({ where: { id } });
        if (!theaterSystem) {
            throw new NotFoundException(`TheaterSystem with ID ${id} not found`);

        }
        Object.assign(theaterSystem, updateTheaterSystemDto);
        return await this.theaterSystemRepository.save(theaterSystem);
    }

    async deleteTheaterSystem(id: string) {
        const theaterSystem = await this.theaterSystemRepository.findOne({ where: { id } });
        if (!theaterSystem) {
            throw new NotFoundException(`TheaterSystem with ID ${id} not found`);

        }
        return await this.theaterSystemRepository.remove(theaterSystem);
    }
}
