import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Showtime } from './entities/showtime.entity';
import { CreateShowtimeDto } from './dto/create-showtime.dto';
import { UpdateShowtimeDto } from './dto/update-showtime.dto';
import { PaginationDto } from '../user/dto/user.dto';
import { pagination } from 'src/utils/pagination';

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

  async getAllShowtimes(paginationDto: PaginationDto) {
    const { skip, take, page, limit } = pagination(paginationDto.page ?? 1, paginationDto.limit ?? 10);
    const search = paginationDto.search;
    const [showtimes, total] = await this.showtimeRepository.findAndCount({
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
      where: search ? {
        movie: {
          title: ILike(`%${search}%`),
        },
      } : {},
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });
    return { showtimes, total, page, limit, totalPages: Math.ceil(total / limit) };
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
