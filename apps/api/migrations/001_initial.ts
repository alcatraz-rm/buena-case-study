import { Kysely, SqlBool, sql } from 'kysely';

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('buildingUnit').ifExists().execute();
  await db.schema.dropTable('building').ifExists().execute();
  await db.schema.dropTable('property').ifExists().execute();
  await db.schema.dropTable('accountant').ifExists().execute();
  await db.schema.dropTable('manager').ifExists().execute();

  await db.schema.dropType('buildingUnitType').ifExists().execute();
  await db.schema.dropType('managementType').ifExists().execute();
}

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema.createType('managementType').asEnum(['WEG', 'MV']).execute();

  await db.schema
    .createType('buildingUnitType')
    .asEnum(['Apartment', 'Office', 'Garden', 'Parking'])
    .execute();

  await db.schema
    .createTable('manager')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('createdAt', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn('updatedAt', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn('deletedAt', 'timestamptz')
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('email', 'text', (col) => col.notNull().unique())
    .execute();

  await db.schema
    .createTable('accountant')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('createdAt', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn('updatedAt', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn('deletedAt', 'timestamptz')
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('email', 'text', (col) => col.notNull().unique())
    .execute();

  await db.schema
    .createTable('property')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('createdAt', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn('updatedAt', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn('deletedAt', 'timestamptz')
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('managementType', sql`management_type`, (col) => col.notNull())
    .addColumn('managerId', 'integer', (col) =>
      col.references('manager.id').onDelete('restrict').notNull(),
    )
    .addColumn('accountantId', 'integer', (col) =>
      col.references('accountant.id').onDelete('restrict').notNull(),
    )
    .addColumn('declarationOfDivisionFileUrl', 'text')
    .addColumn('declarationOfDivisionFileName', 'text')
    .addColumn('declarationOfDivisionMimeType', 'text')
    .addColumn('declarationOfDivisionUploadedAt', 'timestamptz')
    .execute();

  await db.schema
    .createTable('building')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('createdAt', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn('updatedAt', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn('deletedAt', 'timestamptz')
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('street', 'text', (col) => col.notNull())
    .addColumn('houseNumber', 'text', (col) => col.notNull())
    .addColumn('postalCode', 'text', (col) => col.notNull())
    .addColumn('city', 'text', (col) => col.notNull())
    .addColumn('country', 'text', (col) => col.notNull())
    .addColumn('propertyId', 'integer', (col) =>
      col.references('property.id').onDelete('cascade').notNull(),
    )
    .execute();

  await db.schema
    .createTable('buildingUnit')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('createdAt', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn('updatedAt', 'timestamptz', (col) =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addColumn('deletedAt', 'timestamptz')
    .addColumn('buildingId', 'integer', (col) =>
      col.references('building.id').onDelete('cascade').notNull(),
    )
    .addColumn('unitType', sql`building_unit_type`, (col) => col.notNull())
    .addColumn('number', 'text', (col) => col.notNull())
    .addColumn('floor', 'text')
    .addColumn('entrance', 'text')
    .addColumn('sizeSqm', 'numeric')
    .addColumn('coOwnershipShare', 'text')
    .addColumn('constructionYear', 'integer')
    .addColumn('rooms', 'numeric')
    .execute();

  await db.schema
    .createIndex('building_unit_building_id_number_unique_active')
    .on('buildingUnit')
    .expression(sql`"building_id", "number"`)
    .where(sql<SqlBool>`"deleted_at" is null`)
    .unique()
    .execute();
}
