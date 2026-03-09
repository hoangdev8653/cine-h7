import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TheaterSystemService } from './theater-system.service';
import { TheaterSystemController } from './theater-system.controller';
import { TheaterSystem } from './entities/theater-system.entity';

@Module({
    imports: [TypeOrmModule.forFeature([TheaterSystem])],
    controllers: [TheaterSystemController],
    providers: [TheaterSystemService],
    exports: [TheaterSystemService],
})
export class TheaterSystemModule { }
