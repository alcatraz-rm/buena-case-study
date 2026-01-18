import { Module } from '@nestjs/common';
import { PropertyController } from './property.controller';
import { PropertyService } from './property.service';
import { KyselyModule } from '../kysely/kysely.module';

@Module({
  controllers: [PropertyController],
  providers: [PropertyService],
  exports: [PropertyService],
  imports: [KyselyModule],
})
export class PropertyModule {}
