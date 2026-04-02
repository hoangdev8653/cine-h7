import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-logs.entity';
import { CreateAuditLogDto } from './dto/audit-logs.dto';
import { Logger } from '@nestjs/common';

@Processor('audit-log')
export class AuditLogProcessor extends WorkerHost {
  private readonly logger = new Logger(AuditLogProcessor.name);

  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {
    super();
  }

  async process(job: Job<CreateAuditLogDto, any, string>): Promise<any> {
    this.logger.log(`Processing audit log job: ${job.id}`);
    try {
      const auditLog = this.auditLogRepository.create(job.data);
      await this.auditLogRepository.save(auditLog);
      this.logger.log(`Successfully saved audit log for action: ${job.data.action}`);
    } catch (error) {
      this.logger.error(`Failed to save audit log: ${error.message}`);
      throw error; 
    }
  }
}
