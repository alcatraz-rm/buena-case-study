import { Module } from '@nestjs/common';
import { KyselyModule } from '../kysely/kysely.module';
import { StoredFileController } from './stored-file.controller';
import { StoredFileService } from './stored-file.service';

@Module({
  imports: [KyselyModule],
  controllers: [StoredFileController],
  providers: [StoredFileService],
  exports: [StoredFileService],
})
export class StoredFileModule {}
