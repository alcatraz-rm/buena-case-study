import { config } from 'dotenv';
config({ path: ['.env.local', '.env'] });

import { CamelCasePlugin } from 'kysely';
import { defineConfig } from 'kysely-ctl';
import { PostgresJSDialect } from 'kysely-postgres-js';
import postgres from 'postgres';

export default defineConfig({
  migrations: {
    migrationFolder: new URL('../migrations', import.meta.url).pathname,
  },
  seeds: { seedFolder: new URL('../seeds', import.meta.url).pathname },
  dialect: new PostgresJSDialect({
    postgres: postgres(process.env.DATABASE_URL ?? ''),
  }),
  plugins: [new CamelCasePlugin()],
});
