import { BullRootModuleOptions } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';

export const redisConfig = {
    useFactory: async (
        configService: ConfigService,
    ): Promise<BullRootModuleOptions> => ({
        connection: {
            host: configService.get<string>('REDIS_HOST', 'localhost'),
            port: parseInt(configService.get<string>('REDIS_PORT', '6379'), 10),
            username: configService.get<string>('REDIS_USERNAME') || 'default',
            password: configService.get<string>('REDIS_PASSWORD'),
        },
    }),
    inject: [ConfigService],
};