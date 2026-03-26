import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { TheaterService } from './theater.service';
import { CreateTheaterDto } from './dto/create-theater.dto';
import { UpdateTheaterDto } from './dto/update-theater.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaginationDto } from '../user/dto/user.dto';

@Controller('theater')
export class TheaterController {
  constructor(private readonly theaterService: TheaterService) { }

  @Post()
  @UseInterceptors(FileInterceptor('logo'))
  async createTheater(
    @Body() createTheaterDto: CreateTheaterDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.theaterService.createTheater(createTheaterDto, file);
  }

  @Get()
  async getAllTheaters(@Query() paginationDto: PaginationDto, @Req() req: any) {
    const hasQueryParams = Object.keys(req.query).length > 0;
    return await this.theaterService.getAllTheaters(
      paginationDto,
      hasQueryParams,
    );
  }

  @Get(':id')
  async getTheaterById(@Param('id', ParseUUIDPipe) id: string) {
    return await this.theaterService.getTheaterById(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('logo'))
  async updateTheater(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTheaterDto: UpdateTheaterDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.theaterService.updateTheater(id, updateTheaterDto, file);
  }

  @Delete(':id')
  async deleteTheater(@Param('id', ParseUUIDPipe) id: string) {
    return await this.theaterService.deleteTheater(id);
  }
}
