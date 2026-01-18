import { Module } from '@nestjs/common';
import { KyselyModule } from '../kysely/kysely.module';
import { BuildingUnitsController } from './building-units.controller';
import { UnitController } from './unit.controller';
import { UnitService } from './unit.service';

@Module({
  controllers: [UnitController, BuildingUnitsController],
  providers: [UnitService],
  exports: [UnitService],
  imports: [KyselyModule],
})
export class UnitModule {}
