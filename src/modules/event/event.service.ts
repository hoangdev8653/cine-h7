import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PaginationDto } from '../user/dto/user.dto';
import { pagination } from 'src/utils/pagination';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async createEvent(
    createEventDto: CreateEventDto,
    thumbnail?: Express.Multer.File,
  ): Promise<Event> {
    const event = this.eventRepository.create(createEventDto);
    if (thumbnail) {
      const result = await this.cloudinaryService.uploadFile(thumbnail);
      event.thumbnail = result.secure_url;
    }
    return await this.eventRepository.save(event);
  }

  async getAllEvents(
    paginationDto: PaginationDto,
    hasQueryParams: boolean = true,
  ) {
    const { skip, take, page, limit } = pagination(
      paginationDto.page ?? 1,
      paginationDto.limit ?? 10,
    );
    const search = paginationDto.search;
    if (hasQueryParams) {
      const [events, total] = await this.eventRepository.findAndCount({
        skip,
        take,
        where: search
          ? {
              title: ILike(`%${search}%`),
            }
          : {},
        order: { created_at: 'DESC' },
      });
      return {
        events,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } else {
      const events = await this.eventRepository.find({
        order: { created_at: 'DESC' },
      });
      return { events };
    }
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

  async updateEvent(
    id: string,
    updateEventDto: UpdateEventDto,
  ): Promise<Event> {
    const event = await this.getEventById(id);
    Object.assign(event, updateEventDto);
    return await this.eventRepository.save(event);
  }

  async deleteEvent(id: string): Promise<void> {
    const event = await this.getEventById(id);
    await this.eventRepository.remove(event);
  }
}
