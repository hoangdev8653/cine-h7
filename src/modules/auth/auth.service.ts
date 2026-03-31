import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import {
  RegisterDto,
  LoginDto,
  GoogleLoginDto,
} from './dto/auth.dto';
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
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email đã tồn tại');
    }
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    await this.mailService.sendMail(
      registerDto.email,
      'Chào mừng bạn đến với CineH7 - Đặt vé xem phim online',
      `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 20px auto; padding: 30px; border: 1px solid #eee; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #e50914; margin: 0; font-size: 28px;">CineH7</h1>
                    <p style="color: #666; font-size: 14px; margin-top: 5px;">Hệ thống đặt vé xem phim trực tuyến hàng đầu</p>
                </div>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p>Xin chào <strong>${registerDto.name}</strong>,</p>
                <p>Cảm ơn bạn đã tin tưởng và đăng ký tài khoản tại <strong>CineH7</strong>. Với tài khoản này, bạn có thể dễ dàng đặt vé, theo dõi lịch chiếu và nhận nhiều ưu đãi hấp dẫn.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="http://localhost:5173/login" 
                       style="display: inline-block; padding: 14px 32px; background-color: #e50914; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; transition: background-color 0.3s inset;">
                       Khám phá ngay
                    </a>
                </div>
                <p style="color: #666; font-size: 14px; line-height: 1.5;">Chúc bạn có những giây phút xem phim tuyệt vời tại CineH7!</p>
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
                    <p style="font-size: 12px; color: #999;">Đây là email tự động từ hệ thống CineH7. Vui lòng không phản hồi email này.</p>
                </div>
            </div>`,
    );
    const user = await this.userRepository.save({
      ...registerDto,
      password: hashedPassword,
      auth_method: 'LOCAL',
    });
    return user;
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const isPasswordMatching = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const payload = { email: user.email, sub: user.id };
    const { access_token, refresh_token } = generateToken(
      this.jwtService,
      payload,
    );
    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        status: user.status,
        avarta: user.avarta,
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
    const payloadFromGoogle = await this.verifyGoogleToken(
      googleLoginDto.googleToken,
    );
    if (!payloadFromGoogle) {
      throw new UnauthorizedException('Không thể lấy thông tin từ Google');
    }

    const { email, name, picture: avarta } = payloadFromGoogle;

    let user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      user = this.userRepository.create({
        email,
        name,
        avarta,
        auth_method: 'GOOGLE',
        password: '',
      });
      await this.userRepository.save(user);
    } else {
      if (avarta && user.avarta !== avarta) {
        await this.userRepository.update(user.id, { avarta: avarta });
      }
    }

    const payload = { email: user.email, sub: user.id };
    const { access_token, refresh_token } = generateToken(
      this.jwtService,
      payload,
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avarta: user.avarta,
      },
      access_token,
      refresh_token,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
      const newPayload = { email: payload.email, sub: payload.sub };
      return {
        access_token: this.jwtService.sign(newPayload),
      };
    } catch (e) {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }
  }
}
