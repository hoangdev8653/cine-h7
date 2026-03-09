import { PartialType } from '@nestjs/mapped-types';
import { CreateTheaterSystemDto } from './create-theater-system.dto';

export class UpdateTheaterSystemDto extends PartialType(CreateTheaterSystemDto) { }
