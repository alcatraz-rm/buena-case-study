import { Module } from '@nestjs/common';
import { KyselyModule } from '../kysely/kysely.module';
import { BuildingController } from './building.controller';
import { BuildingService } from './building.service';
import { PropertyBuildingsController } from './property-buildings.controller';

@Module({
  controllers: [BuildingController, PropertyBuildingsController],
  providers: [BuildingService],
  exports: [BuildingService],
  imports: [KyselyModule],
})
export class BuildingModule {}
