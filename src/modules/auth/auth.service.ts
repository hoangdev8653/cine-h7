import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) { }

    async register(registerDto: RegisterDto) {
        const existingUser = await this.userService.findOneByEmail(registerDto.email);
        if (existingUser) {
            throw new ConflictException('Email đã tồn tại');
        }

        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const user = await this.userService.create({
            ...registerDto,
            password: hashedPassword,
        });

        const { password, ...result } = user;
        return result;
    }

    async login(loginDto: LoginDto) {
        const user = await this.userService.findOneByEmail(loginDto.email);
        if (!user) {
            throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
        }

        const isPasswordMatching = await bcrypt.compare(loginDto.password, user.password);
        if (!isPasswordMatching) {
            throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
        }

        const payload = { email: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
            },
        };
    }

    async refresh(refreshTokenDto: RefreshTokenDto) {
        // Basic implementation for demonstration
        // In a real app, you would verify the refresh token against a database/secret
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
