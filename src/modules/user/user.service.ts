import { Injectable } from '@nestjs/common';
import { User } from "./entities/user.entity";
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
    @InjectRepository(User)
    private userRepository: Repository<User>;

    async getAllUsers() {
        const user = await this.userRepository.find();
        return user;
    }

    async getUserById(id: string) {
        const user = await this.userRepository.findOne({ where: { id } });
        return user;
    }
}
