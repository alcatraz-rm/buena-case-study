import { Module } from '@nestjs/common';
import { KyselyModule } from '../kysely/kysely.module';
import { ManagerController } from './manager.controller';
import { ManagerService } from './manager.service';

@Module({
  imports: [KyselyModule],
  controllers: [ManagerController],
  providers: [ManagerService],
})
export class ManagerModule {}
