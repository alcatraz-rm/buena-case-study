import type { Kysely } from 'kysely';
import type { Database } from '~/modules/kysely/database';

export async function seed(db: Kysely<Database>): Promise<void> {
  await db
    .insertInto('manager')
    .values([
      { name: 'Bob Marley', email: 'bob.marley@example.com' },
      { name: 'Ed Sheeran', email: 'ed.sheeran@example.com' },
      { name: 'Taylor Swift', email: 'taylor.swift@example.com' },
    ])
    .onConflict((oc) => oc.column('email').doNothing())
    .execute();

  await db
    .insertInto('accountant')
    .values([
      { name: 'Oprah Winfrey', email: 'oprah.winfrey@example.com' },
      { name: 'Serena Williams', email: 'serena.williams@example.com' },
      { name: 'Keanu Reeves', email: 'keanu.reeves@example.com' },
    ])
    .onConflict((oc) => oc.column('email').doNothing())
    .execute();
}
