import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { AccountantModule } from './modules/accountant/accountant.module';
import { BuildingModule } from './modules/building/building.module';
import { KyselyModule } from './modules/kysely/kysely.module';
import { ManagerModule } from './modules/manager/manager.module';
import { PropertyModule } from './modules/property/property.module';
import { UnitModule } from './modules/unit/unit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      // validate: validateEnv,
    }),
    KyselyModule,
    ManagerModule,
    AccountantModule,
    PropertyModule,
    BuildingModule,
    UnitModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
