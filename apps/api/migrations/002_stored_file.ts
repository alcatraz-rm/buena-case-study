import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable('storedFile')
    .addColumn('id', 'uuid', (col) =>
      col
        .primaryKey()
        .notNull()
        .defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('createdAt', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn('updatedAt', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn('deletedAt', 'timestamptz')
    .addColumn('originalName', 'text', (col) => col.notNull())
    .addColumn('mimeType', 'text', (col) => col.notNull())
    .addColumn('sizeBytes', 'integer', (col) => col.notNull())
    .addColumn('content', sql`bytea`, (col) => col.notNull())
    .execute();

  await db.schema
    .alterTable('property')
    .addForeignKeyConstraint(
      'property_declaration_of_division_file_id_fk',
      ['declaration_of_division_file_id'],
      'stored_file',
      ['id'],
      (cb) => cb.onDelete('set null'),
    )
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .alterTable('property')
    .dropConstraint('property_declaration_of_division_file_id_fk')
    .execute();

  await db.schema.dropTable('storedFile').ifExists().execute();
}
