import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
    @IsEmail({}, { message: 'Email không hợp lệ' })
    @IsNotEmpty({ message: 'Email không được để trống' })
    email: string;

    @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
    @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
    password: string;

    @IsNotEmpty({ message: 'Tên người dùng không được để trống' })
    name: string;
}

export class LoginDto {
    @IsEmail({}, { message: 'Email không hợp lệ' })
    @IsNotEmpty({ message: 'Email không được để trống' })
    email: string;

    @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
    password: string;
}

export class RefreshTokenDto {
    @IsNotEmpty({ message: 'Refresh token không được để trống' })
    refreshToken: string;
}

export class GoogleLoginDto {
    @IsNotEmpty({ message: 'Google token không được để trống' })
    googleToken: string;
}
