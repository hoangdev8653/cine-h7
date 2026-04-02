import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { JwtStrategy } from 'src/guards/jwt-auth.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from 'src/config/mail.config';

@Module({
    imports: [
        UserModule,
        AuditLogsModule,
        TypeOrmModule.forFeature([User]),
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: '1d' },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, MailService],
    exports: [AuthService, JwtStrategy, MailService],
})
export class AuthModule { }
