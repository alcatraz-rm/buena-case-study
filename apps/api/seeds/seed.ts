import type { Kysely } from 'kysely';
import type { Database } from '~/modules/kysely/database';

export async function seed(db: Kysely<Database>): Promise<void> {
  await db.transaction().execute(async (trx) => {
    await trx
      .insertInto('manager')
      .values([
        { name: 'Bob Marley', email: 'bob.marley@example.com' },
        { name: 'Ed Sheeran', email: 'ed.sheeran@example.com' },
        { name: 'Taylor Swift', email: 'taylor.swift@example.com' },
      ])
      .onConflict((oc) => oc.column('email').doNothing())
      .execute();

    await trx
      .insertInto('accountant')
      .values([
        { name: 'Oprah Winfrey', email: 'oprah.winfrey@example.com' },
        { name: 'Serena Williams', email: 'serena.williams@example.com' },
        { name: 'Keanu Reeves', email: 'keanu.reeves@example.com' },
      ])
      .onConflict((oc) => oc.column('email').doNothing())
      .execute();

    const bob = await trx
      .selectFrom('manager')
      .select(['id'])
      .where('manager.email', '=', 'bob.marley@example.com')
      .where('manager.deletedAt', 'is', null)
      .executeTakeFirstOrThrow();

    const taylor = await trx
      .selectFrom('manager')
      .select(['id'])
      .where('manager.email', '=', 'taylor.swift@example.com')
      .where('manager.deletedAt', 'is', null)
      .executeTakeFirstOrThrow();

    const oprah = await trx
      .selectFrom('accountant')
      .select(['id'])
      .where('accountant.email', '=', 'oprah.winfrey@example.com')
      .where('accountant.deletedAt', 'is', null)
      .executeTakeFirstOrThrow();

    const keanu = await trx
      .selectFrom('accountant')
      .select(['id'])
      .where('accountant.email', '=', 'keanu.reeves@example.com')
      .where('accountant.deletedAt', 'is', null)
      .executeTakeFirstOrThrow();

    async function ensureProperty(input: {
      name: string;
      managementType: 'WEG' | 'MV';
      managerId: number;
      accountantId: number;
    }): Promise<number> {
      const existing = await trx
        .selectFrom('property')
        .select(['id'])
        .where('property.name', '=', input.name)
        .where('property.deletedAt', 'is', null)
        .executeTakeFirst();

      if (existing) return existing.id;

      const created = await trx
        .insertInto('property')
        .values({
          name: input.name,
          managementType: input.managementType,
          managerId: input.managerId,
          accountantId: input.accountantId,
          declarationOfDivisionFileId: null,
        })
        .returning(['id'])
        .executeTakeFirstOrThrow();

      return created.id;
    }

    async function ensureBuilding(
      propertyId: number,
      input: {
        name: string;
        street: string;
        houseNumber: string;
        postalCode: string;
        city: string;
        country: string;
      },
    ): Promise<number> {
      const existing = await trx
        .selectFrom('building')
        .select(['id'])
        .where('building.propertyId', '=', propertyId)
        .where('building.name', '=', input.name)
        .where('building.deletedAt', 'is', null)
        .executeTakeFirst();

      if (existing) return existing.id;

      const created = await trx
        .insertInto('building')
        .values({
          propertyId,
          name: input.name,
          street: input.street,
          houseNumber: input.houseNumber,
          postalCode: input.postalCode,
          city: input.city,
          country: input.country,
        })
        .returning(['id'])
        .executeTakeFirstOrThrow();

      return created.id;
    }

    async function ensureUnit(
      buildingId: number,
      input: {
        unitType: 'Apartment' | 'Office' | 'Garden' | 'Parking';
        number: string;
        description?: string | null;
        floor?: string | null;
        entrance?: string | null;
        sizeSqm?: number | null;
        rooms?: number | null;
        constructionYear?: number | null;
        coOwnershipShare?: string | null;
      },
    ): Promise<void> {
      const existing = await trx
        .selectFrom('buildingUnit')
        .select(['id'])
        .where('buildingUnit.buildingId', '=', buildingId)
        .where('buildingUnit.number', '=', input.number)
        .where('buildingUnit.deletedAt', 'is', null)
        .executeTakeFirst();

      if (existing) return;

      await trx
        .insertInto('buildingUnit')
        .values({
          buildingId,
          unitType: input.unitType,
          number: input.number,
          description: input.description ?? null,
          floor: input.floor ?? null,
          entrance: input.entrance ?? null,
          sizeSqm: input.sizeSqm ?? null,
          rooms: input.rooms ?? null,
          constructionYear: input.constructionYear ?? null,
          coOwnershipShare: input.coOwnershipShare ?? null,
        })
        .execute();
    }

    // Property 1 (Berlin) — 2 buildings
    const p1 = await ensureProperty({
      name: 'WEG Sonnenallee 10–12 (Berlin-Neukölln)',
      managementType: 'WEG',
      managerId: bob.id,
      accountantId: oprah.id,
    });

    const p1b1 = await ensureBuilding(p1, {
      name: 'Haus A',
      street: 'Sonnenallee',
      houseNumber: '10',
      postalCode: '12045',
      city: 'Berlin',
      country: 'DE',
    });

    const p1b2 = await ensureBuilding(p1, {
      name: 'Haus B',
      street: 'Sonnenallee',
      houseNumber: '12',
      postalCode: '12045',
      city: 'Berlin',
      country: 'DE',
    });

    await ensureUnit(p1b1, {
      unitType: 'Apartment',
      number: 'A-01',
      floor: 'EG',
      entrance: 'A',
      rooms: 2,
      sizeSqm: 54.2,
      constructionYear: 1988,
      coOwnershipShare: '54/1000',
      description: '2-room apartment with balcony to the courtyard',
    });
    await ensureUnit(p1b1, {
      unitType: 'Apartment',
      number: 'A-12',
      floor: '1. OG',
      entrance: 'A',
      rooms: 3,
      sizeSqm: 71.8,
      constructionYear: 1988,
      coOwnershipShare: '72/1000',
      description: '3-room apartment, street-facing',
    });
    await ensureUnit(p1b1, {
      unitType: 'Parking',
      number: 'A-P1',
      description: 'Courtyard parking spot',
      coOwnershipShare: '10/1000',
    });

    await ensureUnit(p1b2, {
      unitType: 'Apartment',
      number: 'B-02',
      floor: 'EG',
      entrance: 'B',
      rooms: 1,
      sizeSqm: 38.5,
      constructionYear: 1988,
      coOwnershipShare: '39/1000',
      description: 'Studio apartment (rear building)',
    });
    await ensureUnit(p1b2, {
      unitType: 'Office',
      number: 'B-G01',
      floor: 'EG',
      entrance: 'B',
      rooms: 4,
      sizeSqm: 96.0,
      constructionYear: 1988,
      coOwnershipShare: '96/1000',
      description: 'Ground-floor commercial unit (office)',
    });

    // Property 2 (Munich) — 3 buildings
    const p2 = await ensureProperty({
      name: 'MV Leopoldstraße 50 (München-Schwabing)',
      managementType: 'MV',
      managerId: taylor.id,
      accountantId: keanu.id,
    });

    const p2b1 = await ensureBuilding(p2, {
      name: 'Vorderhaus',
      street: 'Leopoldstraße',
      houseNumber: '50',
      postalCode: '80802',
      city: 'München',
      country: 'DE',
    });
    const p2b2 = await ensureBuilding(p2, {
      name: 'Hinterhaus',
      street: 'Leopoldstraße',
      houseNumber: '50A',
      postalCode: '80802',
      city: 'München',
      country: 'DE',
    });
    const p2b3 = await ensureBuilding(p2, {
      name: 'Gartenhaus',
      street: 'Leopoldstraße',
      houseNumber: '50B',
      postalCode: '80802',
      city: 'München',
      country: 'DE',
    });

    await ensureUnit(p2b1, {
      unitType: 'Apartment',
      number: 'VH-21',
      floor: '2. OG',
      entrance: 'VH',
      rooms: 2,
      sizeSqm: 62.0,
      constructionYear: 1974,
      coOwnershipShare: '62/1000',
      description: '2-room apartment with loggia',
    });
    await ensureUnit(p2b1, {
      unitType: 'Office',
      number: 'VH-G02',
      floor: 'EG',
      entrance: 'VH',
      rooms: 6,
      sizeSqm: 140.5,
      constructionYear: 1974,
      coOwnershipShare: '141/1000',
      description: 'Street-level office / practice space',
    });

    await ensureUnit(p2b2, {
      unitType: 'Apartment',
      number: 'HH-03',
      floor: 'EG',
      entrance: 'HH',
      rooms: 3,
      sizeSqm: 79.3,
      constructionYear: 1974,
      coOwnershipShare: '79/1000',
      description: 'Family apartment facing the courtyard',
    });
    await ensureUnit(p2b2, {
      unitType: 'Parking',
      number: 'HH-P2',
      description: 'Underground parking space #2',
      coOwnershipShare: '12/1000',
    });

    await ensureUnit(p2b3, {
      unitType: 'Garden',
      number: 'GH-G1',
      description: 'Private garden plot (rear building)',
      coOwnershipShare: '8/1000',
    });
    await ensureUnit(p2b3, {
      unitType: 'Apartment',
      number: 'GH-11',
      floor: '1. OG',
      entrance: 'GH',
      rooms: 1,
      sizeSqm: 34.9,
      constructionYear: 1974,
      coOwnershipShare: '35/1000',
      description: 'Small apartment (garden house)',
    });
  });
}
