import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { TheaterSystem } from './entities/theater-system.entity';
import { CreateTheaterSystemDto, UpdateTheaterSystemDto } from './dto/theater-system.dto';
import { CloudinaryService } from "../cloudinary/cloudinary.service"
import { PaginationDto } from '../user/dto/user.dto';
import { pagination } from 'src/utils/pagination';

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

    async getAllTheaterSystems(paginationDto: PaginationDto) {
        const { skip, take, page, limit } = pagination(paginationDto.page ?? 1, paginationDto.limit ?? 10);
        const search = paginationDto.search;
        const [data, total] = await this.theaterSystemRepository.findAndCount({
            skip,
            take,
            where: search ? {
                name: ILike(`%${search}%`),
            } : {},
            relations: ['theaters'],
            order: { created_at: 'DESC' },
        });
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
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
