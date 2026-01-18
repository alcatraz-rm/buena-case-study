import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KyselyService } from './kysely.service';

@Module({
  exports: [KyselyService],
  providers: [ConfigService, KyselyService],
})
export class KyselyModule {}
