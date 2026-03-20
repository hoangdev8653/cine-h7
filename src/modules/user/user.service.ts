import { Injectable } from '@nestjs/common';
import { User } from "./entities/user.entity";
import { ILike, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto, UpdateUserDto } from './dto/user.dto';
import { pagination } from 'src/utils/pagination';

@Injectable()
export class UserService {
    @InjectRepository(User)
    private userRepository: Repository<User>;

    async getAllUsers(paginationDto: PaginationDto) {
        const { skip, take, page, limit } = pagination(paginationDto.page ?? 1, paginationDto.limit ?? 10);
        const search = paginationDto.search;
        const [user, total] = await this.userRepository.findAndCount({
            skip,
            take,
            where: search ? [
                { name: ILike(`%${search}%`) },
                { email: ILike(`%${search}%`) },
            ] : {},
            order: { created_at: 'DESC' },
        });
        return { user, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async getUserById(id: string) {
        return await this.userRepository.findOne({ where: { id } });
    }

    async updateUser(id: string, updateUserDto: UpdateUserDto) {
        await this.userRepository.update(id, updateUserDto);
        return await this.getUserById(id);
    }

    async deleteUser(id: string) {
        const result = await this.userRepository.delete(id);
        return { deleted: (result.affected ?? 0) > 0 };
    }
}
