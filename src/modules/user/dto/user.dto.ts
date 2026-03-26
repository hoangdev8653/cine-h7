import { IsInt, IsOptional, Min, IsString, IsEnum } from "class-validator";
import { Type } from "class-transformer";

export class PaginationDto {
    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    page?: number = 1;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    limit?: number = 10;

    @IsOptional()
    @IsString()
    search?: string;
}

export class UpdateRoleDto {
    @IsEnum(['ADMIN', 'EMPLOYEE'])
    role: 'ADMIN' | 'EMPLOYEE';
}

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsEnum(['ADMIN', 'EMPLOYEE'])
    role?: 'ADMIN' | 'EMPLOYEE';

    @IsOptional()
    @IsEnum(['ACTIVE', 'INACTIVE'])
    status?: 'ACTIVE' | 'INACTIVE';

    @IsOptional()
    @IsString()
    avatar?: string;
}