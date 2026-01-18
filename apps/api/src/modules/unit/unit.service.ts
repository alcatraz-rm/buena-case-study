import { Injectable, NotFoundException } from '@nestjs/common';
import { BuildingUnit } from '../kysely/database';
import { KyselyService } from '../kysely/kysely.service';
import type { CreateUnitDto, UpdateUnitUnderBuildingDto } from './types';

@Injectable()
export class UnitService {
  constructor(private readonly kysely: KyselyService) {}

  async create(dto: CreateUnitDto): Promise<BuildingUnit> {
    const created = await this.kysely.db
      .insertInto('buildingUnit')
      .values(dto)
      .returningAll()
      .executeTakeFirstOrThrow();

    return created;
  }

  async findAll(buildingId?: number): Promise<BuildingUnit[]> {
    let query = this.kysely.db
      .selectFrom('buildingUnit')
      .selectAll()
      .where('buildingUnit.deletedAt', 'is', null);

    if (buildingId !== undefined) {
      query = query.where('buildingUnit.buildingId', '=', buildingId);
    }

    return await query.execute();
  }

  async findOne(id: number): Promise<BuildingUnit> {
    const unit = await this.kysely.db
      .selectFrom('buildingUnit')
      .selectAll()
      .where('buildingUnit.id', '=', id)
      .where('buildingUnit.deletedAt', 'is', null)
      .executeTakeFirst();

    if (!unit) {
      throw new NotFoundException('Unit not found');
    }

    return unit;
  }

  async update(
    id: number,
    buildingId: number,
    dto: UpdateUnitUnderBuildingDto,
  ): Promise<BuildingUnit> {
    const result = await this.kysely.db
      .updateTable('buildingUnit')
      .set(dto)
      .where('buildingUnit.id', '=', id)
      .where('buildingUnit.buildingId', '=', buildingId)
      .where('buildingUnit.deletedAt', 'is', null)
      .returningAll()
      .executeTakeFirst();

    if (!result) {
      throw new NotFoundException('Unit not found');
    }

    return result;
  }

  async remove(id: number, buildingId: number): Promise<void> {
    const result = await this.kysely.db
      .updateTable('buildingUnit')
      .set({ deletedAt: new Date() })
      .where('buildingUnit.id', '=', id)
      .where('buildingUnit.buildingId', '=', buildingId)
      .where('buildingUnit.deletedAt', 'is', null)
      .returningAll()
      .executeTakeFirst();

    if (!result) {
      throw new NotFoundException('Unit not found');
    }
  }
}
