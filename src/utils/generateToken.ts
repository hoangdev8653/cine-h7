import { JwtService } from '@nestjs/jwt';

export const generateToken = (jwtService: JwtService, payload: any) => {
    const access_token = jwtService.sign(payload, {
        expiresIn: '1h',
    });
    const refresh_token = jwtService.sign(payload, {
        expiresIn: '7d',
        secret: process.env.JWT_REFRESH_SECRET,
    });
    return { access_token, refresh_token };
}
