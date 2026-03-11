import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto) {
        const existingUser = await this.userRepository.findOne({ where: { email: registerDto.email } });
        if (existingUser) {
            throw new ConflictException('Email đã tồn tại');
        }
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const user = await this.userRepository.save({
            ...registerDto,
            password: hashedPassword,
        });
        return user;
    }

    async login(loginDto: LoginDto) {
        const user = await this.userRepository.findOne({ where: { email: loginDto.email } });
        if (!user) {
            throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
        }

        const isPasswordMatching = await bcrypt.compare(loginDto.password, user.password);
        if (!isPasswordMatching) {
            throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
        }

        const payload = { email: user.email, sub: user.id };
        const access_token = this.jwtService.sign(payload);
        const refresh_token = this.jwtService.sign(payload, {
            expiresIn: '7d',
        });
        return {
            access_token,
            refresh_token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name,
                status: user.status,
            },
        };
    }

    async refresh(refreshTokenDto: RefreshTokenDto) {
        try {
            const payload = this.jwtService.verify(refreshTokenDto.refreshToken);
            const newPayload = { email: payload.email, sub: payload.sub };
            return {
                access_token: this.jwtService.sign(newPayload),
            };
        } catch (e) {
            throw new UnauthorizedException('Refresh token không hợp lệ');
        }
    }
}
