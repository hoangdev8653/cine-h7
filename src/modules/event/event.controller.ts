import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Controller('event')
export class EventController {
    constructor(private readonly eventService: EventService) { }

    @Post()
    async createEvent(@Body() createEventDto: CreateEventDto) {
        return await this.eventService.createEvent(createEventDto);
    }

    @Get()
    async getAllEvents() {
        return await this.eventService.getAllEvents();
    }

    @Get(':id')
    async getEventById(@Param('id', ParseUUIDPipe) id: string) {
        return await this.eventService.getEventById(id);
    }

    @Get('slug/:slug')
    async getEventBySlug(@Param('slug') slug: string) {
        return await this.eventService.getEventBySlug(slug);
    }

    @Patch(':id')
    async updateEvent(@Param('id', ParseUUIDPipe) id: string, @Body() updateEventDto: UpdateEventDto) {
        return await this.eventService.updateEvent(id, updateEventDto);
    }

    @Delete(':id')
    async deleteEvent(@Param('id', ParseUUIDPipe) id: string) {
        return await this.eventService.deleteEvent(id);
    }
}
