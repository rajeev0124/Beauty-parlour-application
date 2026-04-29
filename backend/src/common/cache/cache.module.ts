import { Module, Global } from '@nestjs/common';
import { CacheService } from './cache.service';

/**
 * Global caching module with in-memory cache
 * Can be upgraded to Redis for production
 */
@Global()
@Module({
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
