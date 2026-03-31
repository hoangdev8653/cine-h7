import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';
import { ILike, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto, UpdateRoleDto, UpdateUserDto } from './dto/user.dto';
import { pagination } from 'src/utils/pagination';
import { MailService } from '../../config/mail.config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  @InjectRepository(User)
  private userRepository: Repository<User>;
  constructor(private readonly mailService: MailService) { }

  async getAllUsers(paginationDto: PaginationDto) {
    const { skip, take, page, limit } = pagination(
      paginationDto.page ?? 1,
      paginationDto.limit ?? 10,
    );
    const search = paginationDto.search;
    const [user, total] = await this.userRepository.findAndCount({
      skip,
      take,
      where: search
        ? [{ name: ILike(`%${search}%`) }, { email: ILike(`%${search}%`) }]
        : {},
      order: { created_at: 'DESC' },
    });
    return { user, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getUserById(id: string) {
    return await this.userRepository.findOne({ where: { id } });
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    await this.userRepository.update(id, updateUserDto);
    return await this.getUserById(id);
  }

  async updateRole(id: string, updateRoleDto: UpdateRoleDto) {
    const user = await this.getUserById(id);
    if (!user) {
      throw new Error('User not found');
    }
    user.role = updateRoleDto.role;
    await this.userRepository.save(user);
    return user;
  }

  async forgetPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new Error('User not found');
    }
    const resetLink = `http://localhost:5173/reset-password?email=${user.email}`;
    this.mailService.sendMail(
      user.email,
      'Yêu cầu đặt lại mật khẩu - CineH7 Cinema',
      `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 20px auto; padding: 30px; border: 1px solid #eee; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #e50914; margin: 0; font-size: 28px;">CineH7</h1>
                    <p style="color: #666; font-size: 14px; margin-top: 5px;">Hệ thống đặt vé xem phim trực tuyến hàng đầu</p>
                </div>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p>Xin chào <strong>${user.name}</strong>,</p>
                <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản CineH7 của bạn. Đừng lo lắng, hãy nhấn vào nút bên dưới để khôi phục quyền truy cập:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" 
                       style="display: inline-block; padding: 14px 32px; background-color: #e50914; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                       Đặt lại mật khẩu
                    </a>
                </div>
                <p style="color: #666; font-size: 14px; line-height: 1.5;"><strong>Lưu ý:</strong> Liên kết này sẽ hết hạn sau 24 giờ. Nếu bạn không gửi yêu cầu này, vui lòng bỏ qua email hoặc liên hệ với bộ phận hỗ trợ của chúng tôi để bảo mật tài khoản.</p>
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
                    <p style="font-size: 12px; color: #999;">© 2026 CineH7 Cinema. All rights reserved.</p>
                </div>
            </div>`,
    );

    await this.userRepository.save(user);
    return { message: 'Email đặt lại mật khẩu đã được gửi' };
  }

  async resetPassword(email: string, newPassword: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new Error('Người dùng không tồn tại');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await this.userRepository.save(user);
    return { message: 'Đặt lại mật khẩu thành công' };
  }

  async deleteUser(id: string) {
    const result = await this.userRepository.delete(id);
    return { deleted: (result.affected ?? 0) > 0 };
  }
}
