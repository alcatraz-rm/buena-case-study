import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
