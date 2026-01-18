import { Module } from '@nestjs/common';
import { KyselyModule } from '../kysely/kysely.module';
import { AccountantController } from './accountant.controller';
import { AccountantService } from './accountant.service';

@Module({
  imports: [KyselyModule],
  controllers: [AccountantController],
  providers: [AccountantService],
})
export class AccountantModule {}
