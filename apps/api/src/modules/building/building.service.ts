import { Injectable, NotFoundException } from '@nestjs/common';
import type { Building } from '../kysely/database';
import { KyselyService } from '../kysely/kysely.service';
import type {
  CreateBuildingDto,
  UpdateBuildingUnderPropertyDto,
} from './types';

@Injectable()
export class BuildingService {
  constructor(private readonly kysely: KyselyService) {}

  async create(dto: CreateBuildingDto): Promise<Building> {
    const building = await this.kysely.db
      .insertInto('building')
      .values(dto)
      .returningAll()
      .executeTakeFirstOrThrow();

    return building;
  }

  async findAll(propertyId?: number): Promise<Building[]> {
    let query = this.kysely.db
      .selectFrom('building')
      .selectAll()
      .where('building.deletedAt', 'is', null);

    if (propertyId !== undefined) {
      query = query.where('building.propertyId', '=', propertyId);
    }

    return await query.execute();
  }

  async findOne(id: number): Promise<Building> {
    const building = await this.kysely.db
      .selectFrom('building')
      .selectAll()
      .where('building.id', '=', id)
      .where('building.deletedAt', 'is', null)
      .executeTakeFirst();

    if (!building) {
      throw new NotFoundException('Building not found');
    }

    return building;
  }

  async update(
    id: number,
    propertyId: number,
    dto: UpdateBuildingUnderPropertyDto,
  ): Promise<Building> {
    const building = await this.kysely.db
      .updateTable('building')
      .set(dto)
      .where('building.id', '=', id)
      .where('building.propertyId', '=', propertyId)
      .where('building.deletedAt', 'is', null)
      .returningAll()
      .executeTakeFirst();

    if (!building) {
      throw new NotFoundException('Building not found');
    }

    return building;
  }

  async remove(id: number, propertyId: number): Promise<void> {
    const building = await this.kysely.db
      .updateTable('building')
      .set({ deletedAt: new Date() })
      .where('building.id', '=', id)
      .where('building.propertyId', '=', propertyId)
      .where('building.deletedAt', 'is', null)
      .returningAll()
      .executeTakeFirst();

    if (!building) {
      throw new NotFoundException('Building not found');
    }
  }
}
