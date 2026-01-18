import { Injectable, NotFoundException } from '@nestjs/common';
import type { Building } from '../kysely/database';
import { KyselyService } from '../kysely/kysely.service';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';

@Injectable()
export class BuildingService {
  constructor(private readonly kysely: KyselyService) {}

  async create(dto: CreateBuildingDto): Promise<Building> {
    const created = await this.kysely.db
      .insertInto('building')
      .values(dto)
      .returningAll()
      .executeTakeFirstOrThrow();

    return created;
  }

  async findAll(propertyId?: number): Promise<Building[]> {
    let query = this.kysely.db
      .selectFrom('building')
      .selectAll()
      .where('deletedAt', 'is', null);

    if (propertyId !== undefined) {
      query = query.where('propertyId', '=', propertyId);
    }

    return await query.execute();
  }

  async findOne(id: number): Promise<Building> {
    const building = await this.kysely.db
      .selectFrom('building')
      .selectAll()
      .where('id', '=', id)
      .where('deletedAt', 'is', null)
      .executeTakeFirst();

    if (!building) {
      throw new NotFoundException('Building not found');
    }

    return building;
  }

  async update(id: number, dto: UpdateBuildingDto): Promise<Building> {
    const result = await this.kysely.db
      .updateTable('building')
      .set(dto)
      .where('id', '=', id)
      .where('deletedAt', 'is', null)
      .returningAll()
      .executeTakeFirst();

    if (!result) {
      throw new NotFoundException('Building not found');
    }

    return result;
  }

  async remove(id: number): Promise<void> {
    const result = await this.kysely.db
      .updateTable('building')
      .set({ deletedAt: new Date() })
      .where('id', '=', id)
      .where('deletedAt', 'is', null)
      .returningAll()
      .executeTakeFirst();

    if (!result) {
      throw new NotFoundException('Building not found');
    }
  }
}
