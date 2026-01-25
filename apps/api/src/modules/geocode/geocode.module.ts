import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { GeocodeController } from './geocode.controller';
import { GeocodeService } from './geocode.service';

@Module({
  imports: [
    CacheModule.register({
      // cache-manager TTL is in seconds
      ttl: 60,
    }),
  ],
  controllers: [GeocodeController],
  providers: [GeocodeService],
})
export class GeocodeModule {}
