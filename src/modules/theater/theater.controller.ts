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
  UseGuards,
} from '@nestjs/common';
import { TheaterService } from './theater.service';
import { CreateTheaterDto, UpdateTheaterDto } from './dto/theater.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaginationDto } from '../user/dto/user.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/role.guard';
import { Roles, UserRole } from 'src/common/enum/user.enum';

@Controller('theater')
export class TheaterController {
  constructor(private readonly theaterService: TheaterService) { }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('logo'))
  async updateTheater(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTheaterDto: UpdateTheaterDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.theaterService.updateTheater(id, updateTheaterDto, file);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async deleteTheater(@Param('id', ParseUUIDPipe) id: string) {
    return await this.theaterService.deleteTheater(id);
  }
}
