import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { RegisterDto, LoginDto, RefreshTokenDto, GoogleLoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { MailService } from 'src/config/mail.config';
import { OAuth2Client } from 'google-auth-library';
import { generateToken } from 'src/utils/generateToken';

@Injectable()
export class AuthService {
    private googleClient: OAuth2Client;

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
        private readonly mailService: MailService,
        private readonly configService: ConfigService,
    ) {
        this.googleClient = new OAuth2Client(
            this.configService.get<string>('GOOGLE_CLIENT_ID')
        );
    }

    async register(registerDto: RegisterDto) {
        const existingUser = await this.userRepository.findOne({ where: { email: registerDto.email } });
        if (existingUser) {
            throw new ConflictException('Email đã tồn tại');
        }
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const user = await this.userRepository.save({
            ...registerDto,
            password: hashedPassword,
            auth_method: 'LOCAL',
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
        const { access_token, refresh_token } = generateToken(this.jwtService, payload);
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

    async verifyGoogleToken(token: string) {
        try {
            const ticket = await this.googleClient.verifyIdToken({
                idToken: token,
                audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
            });
            return ticket.getPayload();
        } catch (error) {
            throw new UnauthorizedException('Google token không hợp lệ');
        }
    }

    async googleLogin(googleLoginDto: GoogleLoginDto) {
        const payloadFromGoogle = await this.verifyGoogleToken(googleLoginDto.googleToken);
        if (!payloadFromGoogle) {
            throw new UnauthorizedException('Không thể lấy thông tin từ Google');
        }

        const { email, name, picture: avatar } = payloadFromGoogle;

        let user = await this.userRepository.findOne({ where: { email } });

        if (!user) {
            user = this.userRepository.create({
                email,
                name,
                avatar,
                auth_method: 'GOOGLE',
                password: '',
            });
            await this.userRepository.save(user);
        } else {
            if (avatar && user.avatar !== avatar) {
                await this.userRepository.update(user.id, { avatar });
            }
        }

        const payload = { email: user.email, sub: user.id };
        const { access_token, refresh_token } = generateToken(this.jwtService, payload);

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatar: user.avatar
            },
            access_token,
            refresh_token,
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
