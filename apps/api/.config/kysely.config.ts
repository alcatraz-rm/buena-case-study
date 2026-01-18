import { config } from 'dotenv';
config({ path: ['.env.local', '.env'] });

import { CamelCasePlugin } from 'kysely';
import { defineConfig } from 'kysely-ctl';
import { PostgresJSDialect } from 'kysely-postgres-js';
import postgres from 'postgres';

export default defineConfig({
  $development: { seeds: { seedFolder: 'seedsDev' } },
  dialect: new PostgresJSDialect({
    postgres: postgres(process.env.DATABASE_URL ?? ''),
  }),
  plugins: [new CamelCasePlugin()],
});
