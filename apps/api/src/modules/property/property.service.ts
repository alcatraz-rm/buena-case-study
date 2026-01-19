import { Injectable, NotFoundException } from '@nestjs/common';
import { Property } from '../kysely/database';
import { KyselyService } from '../kysely/kysely.service';
import type {
  CreatePropertyDto,
  PropertyListItem,
  UpdatePropertyDto,
} from './types';

@Injectable()
export class PropertyService {
  constructor(private readonly kysely: KyselyService) {}

  async create(dto: CreatePropertyDto): Promise<Property> {
    const created = await this.kysely.db
      .insertInto('property')
      .values(dto)
      .returningAll()
      .executeTakeFirstOrThrow();

    return created;
  }

  async findAll(): Promise<PropertyListItem[]> {
    return await this.kysely.db
      .selectFrom('property')
      .leftJoin('building', (join) =>
        join
          .onRef('building.propertyId', '=', 'property.id')
          .on('building.deletedAt', 'is', null),
      )
      .selectAll('property')
      .select((eb) =>
        eb.fn.count('building.id').$castTo<number>().as('buildingCount'),
      )
      .where('property.deletedAt', 'is', null)
      .groupBy('property.id')
      .execute();
  }

  async findOne(id: number): Promise<Property> {
    const property = await this.kysely.db
      .selectFrom('property')
      .selectAll()
      .where('property.id', '=', id)
      .where('property.deletedAt', 'is', null)
      .executeTakeFirst();

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return property;
  }

  async update(id: number, dto: UpdatePropertyDto): Promise<Property> {
    const result = await this.kysely.db
      .updateTable('property')
      .set(dto)
      .where('property.id', '=', id)
      .where('property.deletedAt', 'is', null)
      .returningAll()
      .executeTakeFirst();

    if (!result) {
      throw new NotFoundException('Property not found');
    }

    return result;
  }

  async remove(id: number): Promise<void> {
    const result = await this.kysely.db
      .updateTable('property')
      .set({ deletedAt: new Date() })
      .where('property.id', '=', id)
      .where('property.deletedAt', 'is', null)
      .returningAll()
      .executeTakeFirst();

    if (!result) {
      throw new NotFoundException('Property not found');
    }
  }
}
