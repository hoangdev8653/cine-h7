import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class EventService {
    constructor(
        @InjectRepository(Event)
        private readonly eventRepository: Repository<Event>,
        private readonly cloudinaryService: CloudinaryService,
    ) { }

    async createEvent(createEventDto: CreateEventDto, thumbnail?: Express.Multer.File): Promise<Event> {
        const event = this.eventRepository.create(createEventDto);
        if (thumbnail) {
            const result = await this.cloudinaryService.uploadFile(thumbnail);
            event.thumbnail = result.secure_url;
        }
        return await this.eventRepository.save(event);
    }

    async getAllEvents(): Promise<Event[]> {
        return await this.eventRepository.find();
    }

    async getEventById(id: string): Promise<Event> {
        const event = await this.eventRepository.findOne({ where: { id } });
        if (!event) {
            throw new NotFoundException(`Event with ID ${id} not found`);
        }
        return event;
    }

    async getEventBySlug(slug: string): Promise<Event> {
        const event = await this.eventRepository.findOne({ where: { slug } });
        if (!event) {
            throw new NotFoundException(`Event with slug ${slug} not found`);
        }
        return event;
    }

    async updateEvent(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
        const event = await this.getEventById(id);
        Object.assign(event, updateEventDto);
        return await this.eventRepository.save(event);
    }

    async deleteEvent(id: string): Promise<void> {
        const event = await this.getEventById(id);
        await this.eventRepository.remove(event);
    }
}
