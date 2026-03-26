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

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(loginDto);
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
  async loginGoogle(@Body() googleLoginDto: GoogleLoginDto) {
    const result = await this.authService.googleLogin(googleLoginDto);
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
