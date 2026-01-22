import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CamelCasePlugin, Kysely } from 'kysely';
import { PostgresJSDialect } from 'kysely-postgres-js';
import postgres from 'postgres';
import { Database } from './database';

@Injectable()
export class KyselyService {
  readonly db: Kysely<Database>;

  private readonly logger = new Logger(KyselyService.name);

  constructor(private configService: ConfigService) {
    const dialect = new PostgresJSDialect({
      postgres: postgres(this.configService.getOrThrow<string>('DATABASE_URL')),
    });

    this.db = new Kysely<Database>({
      dialect,
      plugins: [new CamelCasePlugin()],
    });
  }
}
