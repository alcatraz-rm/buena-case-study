import { Module } from '@nestjs/common';
import { KyselyModule } from '../kysely/kysely.module';
import { PdfTextModule } from '../pdf-text/pdf-text.module';
import { StoredFileModule } from '../stored-file/stored-file.module';
import { PropertyController } from './property.controller';
import { PropertyService } from './property.service';

@Module({
  controllers: [PropertyController],
  providers: [PropertyService],
  exports: [PropertyService],
  imports: [KyselyModule, StoredFileModule, PdfTextModule],
})
export class PropertyModule {}
