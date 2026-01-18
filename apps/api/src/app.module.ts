import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KyselyModule } from './modules/kysely/kysely.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      // validate: validateEnv,
    }),
    KyselyModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
