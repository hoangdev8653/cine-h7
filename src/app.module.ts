import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import { typeOrmConfig } from './config/database.config';
import { redisConfig } from './config/redis.config';
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
import { TicketModule } from './modules/ticket/ticket.module';
import { TasksModule } from './modules/schedule/schedule.module';
import { PaymentModule } from './modules/payment/payment.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { RedisModule } from './modules/redis/redis.module';
import { SocketModule } from './modules/socket/socket.module';
import { ReviewModule } from './modules/review/review.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(typeOrmConfig),
    BullModule.forRootAsync(redisConfig),
    ScheduleModule.forRoot(),
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
    SeatModule,
    TicketModule,
    TasksModule,
    PaymentModule,
    StatisticsModule,
    RedisModule,
    SocketModule,
    ReviewModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
