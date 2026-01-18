import { Injectable } from '@nestjs/common';
import type { Building } from '../kysely/database';
import { KyselyService } from '../kysely/kysely.service';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';

@Injectable()
export class BuildingService {
  constructor(private readonly kysely: KyselyService) {}

  async create(dto: CreateBuildingDto): Promise<void> {
    await this.kysely.db.insertInto('building').values(dto).execute();
  }

  async findAll(propertyId?: number): Promise<Building[]> {
    let query = this.kysely.db.selectFrom('building').selectAll();

    if (propertyId !== undefined) {
      query = query.where('propertyId', '=', propertyId);
    }

    return await query.execute();
  }

  async findOne(id: number): Promise<Building | undefined> {
    return await this.kysely.db
      .selectFrom('building')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  async update(id: number, dto: UpdateBuildingDto): Promise<void> {
    await this.kysely.db
      .updateTable('building')
      .set(dto)
      .where('id', '=', id)
      .execute();
  }

  async remove(id: number): Promise<void> {
    await this.kysely.db.deleteFrom('building').where('id', '=', id).execute();
  }
}
