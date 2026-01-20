import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { HealthController } from './health.controller';
import { AccountantModule } from './modules/accountant/accountant.module';
import { BuildingModule } from './modules/building/building.module';
import { GeocodeModule } from './modules/geocode/geocode.module';
import { KyselyModule } from './modules/kysely/kysely.module';
import { ManagerModule } from './modules/manager/manager.module';
import { PropertyModule } from './modules/property/property.module';
import { StoredFileModule } from './modules/stored-file/stored-file.module';
import { UnitModule } from './modules/unit/unit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env', '../../.env'],
    }),
    KyselyModule,
    ManagerModule,
    AccountantModule,
    GeocodeModule,
    PropertyModule,
    BuildingModule,
    UnitModule,
    StoredFileModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
