import { Injectable } from '@nestjs/common';
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
    let query = this.kysely.db.selectFrom('buildingUnit').selectAll();

    if (buildingId !== undefined) {
      query = query.where('buildingId', '=', buildingId);
    }

    return await query.execute();
  }

  async findOne(id: number): Promise<BuildingUnit | undefined> {
    return await this.kysely.db
      .selectFrom('buildingUnit')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  async update(id: number, dto: UpdateUnitDto): Promise<void> {
    await this.kysely.db
      .updateTable('buildingUnit')
      .set(dto)
      .where('id', '=', id)
      .execute();
  }

  async remove(id: number): Promise<void> {
    await this.kysely.db
      .deleteFrom('buildingUnit')
      .where('id', '=', id)
      .execute();
  }
}
