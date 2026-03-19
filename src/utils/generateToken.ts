import { JwtService } from '@nestjs/jwt';

export const generateToken = (jwtService: JwtService, payload: any) => {
    const access_token = jwtService.sign(payload, {
        expiresIn: '1h',
    });
    const refresh_token = jwtService.sign(payload, {
        expiresIn: '7d',
    });
    return { access_token, refresh_token };
}
