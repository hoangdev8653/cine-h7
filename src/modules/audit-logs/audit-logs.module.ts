import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { AuditLog } from './entities/audit-logs.entity';
import { AuditLogsService } from './audit-logs.service';
import { AuditLogsController } from './audit-logs.controller';
import { AuditLogProcessor } from './audit-log.processor';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog]),
    BullModule.registerQueue({
      name: 'audit-log',
    }),
    BullBoardModule.forFeature({
      name: 'audit-log',
      adapter: BullMQAdapter,
    }),
  ],
  controllers: [AuditLogsController],
  providers: [AuditLogsService, AuditLogProcessor],
  exports: [AuditLogsService],
})
export class AuditLogsModule { }
