import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-logs.entity';
import { CreateAuditLogDto, QueryAuditLogDto } from './dto/audit-logs.dto';

@Injectable()
export class AuditLogsService {
    constructor(
        @InjectRepository(AuditLog)
        private auditLogRepository: Repository<AuditLog>,
        @InjectQueue('audit-log')
        private auditLogQueue: Queue,
    ) { }

    async create(createAuditLogDto: CreateAuditLogDto): Promise<void> {
        await this.auditLogQueue.add('log-action', createAuditLogDto, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 5000,
            },
            removeOnComplete: true,
        });
    }

    async getAllAuditLogs(query: QueryAuditLogDto) {
        const { module, action, userId, page = 1, limit = 10 } = query;
        const queryBuilder = this.auditLogRepository.createQueryBuilder('audit_log');

        if (module) {
            queryBuilder.andWhere('audit_log.module = :module', { module });
        }

        if (action) {
            queryBuilder.andWhere('audit_log.action = :action', { action });
        }

        if (userId) {
            queryBuilder.andWhere('audit_log.userId = :userId', { userId });
        }

        const [items, total] = await queryBuilder
            .orderBy('audit_log.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return {
            data: items,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async deleteAuditLog(id: string) {
        const auditLog = await this.auditLogRepository.findOne({ where: { id } });
        if (!auditLog) {
            throw new NotFoundException('Audit log not found');
        }
        return await this.auditLogRepository.remove(auditLog);
    }
}
