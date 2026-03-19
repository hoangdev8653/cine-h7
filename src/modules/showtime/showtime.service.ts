import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Showtime } from './entities/showtime.entity';
import { CreateShowtimeDto } from './dto/create-showtime.dto';
import { UpdateShowtimeDto } from './dto/update-showtime.dto';

@Injectable()
export class ShowtimeService {
  constructor(
    @InjectRepository(Showtime)
    private readonly showtimeRepository: Repository<Showtime>,
  ) { }

  async createShowtime(
    createShowtimeDto: CreateShowtimeDto,
  ): Promise<Showtime> {
    const showtime = this.showtimeRepository.create(createShowtimeDto);
    return await this.showtimeRepository.save(showtime);
  }

  async getAllShowtimes(): Promise<Showtime[]> {
    return await this.showtimeRepository.find({
      relations: {
        movie: true,
        room: true,
      },
      select: {
        id: true,
        movieId: true,
        roomId: true,
        startTime: true,
        price: true,
        created_at: true,
        movie: {
          id: true,
          title: true,
          poster: true,
          duration: true,
        },
        room: {
          id: true,
          name: true,
          type: true,
        },
      },
    });
  }

  async getShowtimeByMovie(movieId: string) {
    const showtimes = await this.showtimeRepository.find({
      where: { movieId },
      order: { startTime: 'ASC' },
      relations: {
        movie: true,
        room: true,
      },
      select: {
        id: true,
        movieId: true,
        roomId: true,
        startTime: true,
        price: true,
        created_at: true,
        movie: {
          id: true,
          title: true,
          poster: true,
          duration: true,
        },
        room: {
          id: true,
          name: true,
          type: true,
        },
      },
    });

    // Gom nhóm theo ngày (YYYY-MM-DD)
    const grouped = showtimes.reduce(
      (acc, current) => {
        const date = new Date(current.startTime).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(current);
        return acc;
      },
      {} as Record<string, Showtime[]>,
    );

    // Chuyển object thành mảng để FE dễ dùng
    return Object.keys(grouped).map((date) => ({
      date,
      showtimes: grouped[date],
    }));
  }

  async getShowtimeById(id: string): Promise<Showtime> {
    const showtime = await this.showtimeRepository.findOne({
      where: { id },
      relations: {
        movie: true,
        room: true,
      },
      select: {
        id: true,
        movieId: true,
        roomId: true,
        startTime: true,
        price: true,
        created_at: true,
        movie: {
          id: true,
          title: true,
          poster: true,
          duration: true,
        },
        room: {
          id: true,
          name: true,
          type: true,
        },
      },
    });
    if (!showtime) {
      throw new NotFoundException(`Showtime with ID ${id} not found`);
    }
    return showtime;
  }

  async updateShowtime(
    id: string,
    updateShowtimeDto: UpdateShowtimeDto,
  ): Promise<Showtime> {
    const showtime = await this.getShowtimeById(id);
    const updatedShowtime = Object.assign(showtime, updateShowtimeDto);
    return await this.showtimeRepository.save(updatedShowtime);
  }

  async deleteShowtime(id: string): Promise<void> {
    const showtime = await this.getShowtimeById(id);
    await this.showtimeRepository.remove(showtime);
  }
}
