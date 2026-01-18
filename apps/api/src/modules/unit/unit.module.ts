import { Module } from '@nestjs/common';
import { UnitController } from './unit.controller';
import { UnitService } from './unit.service';
import { KyselyModule } from '../kysely/kysely.module';

@Module({
  controllers: [UnitController],
  providers: [UnitService],
  exports: [UnitService],
  imports: [KyselyModule],
})
export class UnitModule {}
