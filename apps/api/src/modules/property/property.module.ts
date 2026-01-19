import { Module } from '@nestjs/common';
import { PropertyController } from './property.controller';
import { PropertyService } from './property.service';
import { KyselyModule } from '../kysely/kysely.module';
import { StoredFileService } from '../stored-file/stored-file.service';

@Module({
  controllers: [PropertyController],
  providers: [PropertyService, StoredFileService],
  exports: [PropertyService],
  imports: [KyselyModule],
})
export class PropertyModule {}
