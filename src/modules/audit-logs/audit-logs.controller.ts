import { Controller, Delete, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { QueryAuditLogDto } from './dto/audit-logs.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/role.guard';
import { Roles, UserRole } from 'src/common/enum/user.enum';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditLogsController {
    constructor(private readonly auditLogsService: AuditLogsService) { }

    @Get()
    @Roles(UserRole.ADMIN)
    async getAllAuditLogs(@Query() query: QueryAuditLogDto) {
        return await this.auditLogsService.getAllAuditLogs(query);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    async deleteAuditLog(@Param('id') id: string) {
        return await this.auditLogsService.deleteAuditLog(id);
    }
}
