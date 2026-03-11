import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/database.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { TheaterSystemModule } from './modules/theater-system/theater-system.module';
import { TheaterModule } from './modules/theater/theater.module';
import { EventModule } from './modules/event/event.module';
import { OrderModule } from './modules/order/order.module';
import { CloudinaryModule } from "./modules/cloudinary/cloudinary.module"
import { MovieModule } from './modules/movie/movie.module';
import { ShowtimeModule } from './modules/showtime/showtime.module';
import { RoomModule } from './modules/room/room.module';
import { SeatModule } from './modules/seat/seat.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(typeOrmConfig),
    AuthModule,
    UserModule,
    TheaterSystemModule,
    TheaterModule,
    EventModule,
    OrderModule,
    CloudinaryModule,
    MovieModule,
    ShowtimeModule,
    RoomModule,
    SeatModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
