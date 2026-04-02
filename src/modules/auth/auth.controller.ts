import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  UnauthorizedException,
  Req,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  GoogleLoginDto,
} from './dto/auth.dto';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Throttle({ default: { limit: 5, ttl: 300000 } })
  async register(@Req() req: Request, @Body() registerDto: RegisterDto) {
    const ip = req.ip || req.headers['x-forwarded-for'];
    const userAgent = req.headers['user-agent'];
    return await this.authService.register(registerDto, ip as string, userAgent);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 300000 } })
  async login(
    @Req() req: Request,
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const ip = req.ip || req.headers['x-forwarded-for'];
    const userAgent = req.headers['user-agent'];
    const result = await this.authService.login(loginDto, ip as string, userAgent);
    response.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return result;
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  async loginGoogle(@Req() req: Request, @Body() googleLoginDto: GoogleLoginDto) {
    const ip = req.ip || req.headers['x-forwarded-for'];
    const userAgent = req.headers['user-agent'];
    const result = await this.authService.googleLogin(googleLoginDto, ip as string, userAgent);
    return result;
  }

  @Post('refresh-token')
  async refresh(@Req() request: Request) {
    const refresh_token = request.cookies['refresh_token'] as string;
    if (!refresh_token) {
      throw new UnauthorizedException('Refresh token not found');
    }
    const result = await this.authService.refresh(refresh_token);
    return result;
  }
}
