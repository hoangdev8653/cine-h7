import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { MailService } from '../../config/mail.config';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), CloudinaryModule],
  controllers: [UserController],
  providers: [UserService, MailService],
  exports: [UserService],
})
export class UserModule {}
