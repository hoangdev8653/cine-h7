import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TheaterSystemService } from './theater-system.service';
import { TheaterSystemController } from './theater-system.controller';
import { TheaterSystem } from './entities/theater-system.entity';
import { CloudinaryModule } from "../cloudinary/cloudinary.module"

@Module({
    imports: [TypeOrmModule.forFeature([TheaterSystem]),
        CloudinaryModule
    ],
    controllers: [TheaterSystemController],
    providers: [TheaterSystemService],
    exports: [TheaterSystemService],
})
export class TheaterSystemModule { }
