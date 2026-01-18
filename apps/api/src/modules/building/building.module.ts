import { Module } from '@nestjs/common';
import { BuildingController } from './building.controller';
import { BuildingService } from './building.service';
import { KyselyModule } from '../kysely/kysely.module';

@Module({
  controllers: [BuildingController],
  providers: [BuildingService],
  exports: [BuildingService],
  imports: [KyselyModule],
})
export class BuildingModule {}
