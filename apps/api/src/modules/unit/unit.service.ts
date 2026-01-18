import { Injectable } from '@nestjs/common';
import { KyselyService } from '../kysely/kysely.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { BuildingUnit } from '../kysely/database';

@Injectable()
export class UnitService {
  constructor(private readonly kysely: KyselyService) {}

  async create(dto: CreateUnitDto): Promise<void> {
    await this.kysely.db.insertInto('buildingUnit').values(dto).execute();
  }

  async findAll(): Promise<BuildingUnit[]> {
    return await this.kysely.db
      .selectFrom('buildingUnit')
      .selectAll()
      .execute();
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
