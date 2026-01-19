import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FeatureFlagsController } from './feature-flags.controller';

@Module({
  controllers: [FeatureFlagsController],
  providers: [ConfigService],
})
export class FeatureFlagsModule {}

