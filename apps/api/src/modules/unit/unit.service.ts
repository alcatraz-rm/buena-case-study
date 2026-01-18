import { Injectable, NotFoundException } from '@nestjs/common';
import { BuildingUnit } from '../kysely/database';
import { KyselyService } from '../kysely/kysely.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@Injectable()
export class UnitService {
  constructor(private readonly kysely: KyselyService) {}

  async create(dto: CreateUnitDto): Promise<void> {
    await this.kysely.db.insertInto('buildingUnit').values(dto).execute();
  }

  async findAll(buildingId?: number): Promise<BuildingUnit[]> {
    let query = this.kysely.db
      .selectFrom('buildingUnit')
      .selectAll()
      .where('deletedAt', 'is', null);

    if (buildingId !== undefined) {
      query = query.where('buildingId', '=', buildingId);
    }

    return await query.execute();
  }

  async findOne(id: number): Promise<BuildingUnit> {
    const unit = await this.kysely.db
      .selectFrom('buildingUnit')
      .selectAll()
      .where('id', '=', id)
      .where('deletedAt', 'is', null)
      .executeTakeFirst();

    if (!unit) {
      throw new NotFoundException('Unit not found');
    }

    return unit;
  }

  async update(id: number, dto: UpdateUnitDto): Promise<void> {
    const result = await this.kysely.db
      .updateTable('buildingUnit')
      .set(dto)
      .where('id', '=', id)
      .where('deletedAt', 'is', null)
      .returningAll()
      .execute();

    if (result.length === 0) {
      throw new NotFoundException('Unit not found');
    }
  }

  async remove(id: number): Promise<void> {
    const result = await this.kysely.db
      .updateTable('buildingUnit')
      .set({ deletedAt: new Date() })
      .where('id', '=', id)
      .where('deletedAt', 'is', null)
      .returningAll()
      .execute();

    if (result.length === 0) {
      throw new NotFoundException('Unit not found');
    }
  }
}
