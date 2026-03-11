import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TheaterService } from './theater.service';
import { TheaterController } from './theater.controller';
import { Theater } from './entities/theater.entity';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
    imports: [TypeOrmModule.forFeature([Theater]), CloudinaryModule],
    controllers: [TheaterController],
    providers: [TheaterService],
    exports: [TheaterService],
})
export class TheaterModule { }
