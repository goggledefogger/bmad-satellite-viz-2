/**
 * Redis client utility using official @redis/client
 * Based on Context7 MCP research for optimal Node.js Redis client
 */

import { createClient, RedisClientType } from 'redis';
import { getApiConfig } from '../config/api';

export interface RedisClientConfig {
  url: string;
  retryDelayOnFailover?: number;
  maxRetriesPerRequest?: number;
  lazyConnect?: boolean;
}

export class RedisClient {
  private client: RedisClientType;
  private config: RedisClientConfig;
  private isConnected: boolean = false;

  constructor(config: RedisClientConfig) {
    this.config = config;
    this.client = createClient({
      url: config.url,
      socket: {
        reconnectStrategy: (retries: number) => {
          if (retries > (config.maxRetriesPerRequest || 3)) {
            return new Error('Max retries reached');
          }
          return Math.min(retries * (config.retryDelayOnFailover || 100), 3000);
        },
      },
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.on('error', (err: Error) => {
      console.error('Redis Client Error:', err);
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      console.log('Redis Client Connected');
      this.isConnected = true;
    });

    this.client.on('ready', () => {
      console.log('Redis Client Ready');
    });

    this.client.on('end', () => {
      console.log('Redis Client Disconnected');
      this.isConnected = false;
    });

    this.client.on('reconnecting', () => {
      console.log('Redis Client Reconnecting');
    });
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect();
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.disconnect();
    }
  }

  async ping(): Promise<string> {
    await this.ensureConnected();
    return await this.client.ping();
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<string> {
    await this.ensureConnected();
    if (ttlSeconds) {
      const result = await this.client.setEx(key, ttlSeconds, value);
      return result || 'OK';
    }
    const result = await this.client.set(key, value);
    return result || 'OK';
  }

  async get(key: string): Promise<string | null> {
    await this.ensureConnected();
    return await this.client.get(key);
  }

  async del(key: string): Promise<number> {
    await this.ensureConnected();
    return await this.client.del(key);
  }

  async exists(key: string): Promise<number> {
    await this.ensureConnected();
    return await this.client.exists(key);
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    await this.ensureConnected();
    const result = await this.client.expire(key, seconds);
    return result === 1;
  }

  async ttl(key: string): Promise<number> {
    await this.ensureConnected();
    return await this.client.ttl(key);
  }

  async keys(pattern: string): Promise<string[]> {
    await this.ensureConnected();
    return await this.client.keys(pattern);
  }

  async flushAll(): Promise<string> {
    await this.ensureConnected();
    return await this.client.flushAll();
  }

  async hSet(key: string, field: string, value: string): Promise<number> {
    await this.ensureConnected();
    return await this.client.hSet(key, field, value);
  }

  async hGet(key: string, field: string): Promise<string | undefined> {
    await this.ensureConnected();
    const result = await this.client.hGet(key, field);
    return result || undefined;
  }

  async hGetAll(key: string): Promise<Record<string, string>> {
    await this.ensureConnected();
    return await this.client.hGetAll(key);
  }

  async hDel(key: string, field: string): Promise<number> {
    await this.ensureConnected();
    return await this.client.hDel(key, field);
  }

  async hExists(key: string, field: string): Promise<number> {
    await this.ensureConnected();
    return await this.client.hExists(key, field);
  }

  async sAdd(key: string, members: string[]): Promise<number> {
    await this.ensureConnected();
    return await this.client.sAdd(key, members);
  }

  async sMembers(key: string): Promise<string[]> {
    await this.ensureConnected();
    return await this.client.sMembers(key);
  }

  async sRem(key: string, members: string[]): Promise<number> {
    await this.ensureConnected();
    return await this.client.sRem(key, members);
  }

  async sIsMember(key: string, member: string): Promise<number> {
    await this.ensureConnected();
    return await this.client.sIsMember(key, member);
  }

  async lPush(key: string, elements: string[]): Promise<number> {
    await this.ensureConnected();
    return await this.client.lPush(key, elements);
  }

  async rPush(key: string, elements: string[]): Promise<number> {
    await this.ensureConnected();
    return await this.client.rPush(key, elements);
  }

  async lPop(key: string): Promise<string | null> {
    await this.ensureConnected();
    return await this.client.lPop(key);
  }

  async rPop(key: string): Promise<string | null> {
    await this.ensureConnected();
    return await this.client.rPop(key);
  }

  async lRange(key: string, start: number, stop: number): Promise<string[]> {
    await this.ensureConnected();
    return await this.client.lRange(key, start, stop);
  }

  async lLen(key: string): Promise<number> {
    await this.ensureConnected();
    return await this.client.lLen(key);
  }

  async incr(key: string): Promise<number> {
    await this.ensureConnected();
    return await this.client.incr(key);
  }

  async decr(key: string): Promise<number> {
    await this.ensureConnected();
    return await this.client.decr(key);
  }

  async incrBy(key: string, increment: number): Promise<number> {
    await this.ensureConnected();
    return await this.client.incrBy(key, increment);
  }

  async decrBy(key: string, decrement: number): Promise<number> {
    await this.ensureConnected();
    return await this.client.decrBy(key, decrement);
  }

  async mSet(keyValuePairs: Record<string, string>): Promise<string> {
    await this.ensureConnected();
    return await this.client.mSet(keyValuePairs);
  }

  async mGet(keys: string[]): Promise<(string | null)[]> {
    await this.ensureConnected();
    return await this.client.mGet(keys);
  }

  async mDel(keys: string[]): Promise<number> {
    await this.ensureConnected();
    return await this.client.del(keys);
  }

  async pipeline(): Promise<any> {
    await this.ensureConnected();
    return this.client.multi();
  }

  async exec(pipeline: any): Promise<any[]> {
    return await pipeline.exec();
  }

  private async ensureConnected(): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }
  }

  getClient(): RedisClientType {
    return this.client;
  }

  isHealthy(): boolean {
    return this.isConnected;
  }
}

// Singleton instance
let redisClientInstance: RedisClient | null = null;

export const getRedisClient = (): RedisClient => {
  if (!redisClientInstance) {
    const config = getApiConfig();
    redisClientInstance = new RedisClient({
      url: config.redis.url,
    });
  }
  return redisClientInstance;
};

export const createRedisClient = (config: RedisClientConfig): RedisClient => {
  return new RedisClient(config);
};
