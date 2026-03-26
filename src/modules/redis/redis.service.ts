import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.redisClient = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: parseInt(this.configService.get<string>('REDIS_PORT', '6379'), 10),
      username: this.configService.get<string>('REDIS_USERNAME') || 'default',
      password: this.configService.get<string>('REDIS_PASSWORD'),
    });

    this.redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err.message);
    });

    this.redisClient.on('connect', () => {
      console.log('Redis Client Connected');
    });
  }

  onModuleDestroy() {
    this.redisClient.quit();
  }

  async setLock(key: string, value: string, ttlSeconds: number): Promise<boolean> {
    const result = await this.redisClient.set(key, value, 'EX', ttlSeconds, 'NX');
    return result === 'OK';
  }

  async getLock(key: string): Promise<string | null> {
    return await this.redisClient.get(key);
  }

  async releaseLock(key: string, value: string): Promise<boolean> {
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    const result = await this.redisClient.eval(script, 1, key, value);
    return result === 1;
  }

  async getKeys(pattern: string): Promise<string[]> {
    return await this.redisClient.keys(pattern);
  }
}
