import { Injectable } from '@nestjs/common';
import { KyselyService } from '../kysely/kysely.service';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';

@Injectable()
export class BuildingService {
  constructor(private readonly kysely: KyselyService) {}

  async create(dto: CreateBuildingDto): Promise<void> {
    await this.kysely.db.insertInto('building').values(dto).execute();
  }

  async findAll() {
    return await this.kysely.db.selectFrom('building').selectAll().execute();
  }

  async findOne(id: number) {
    return await this.kysely.db
      .selectFrom('building')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  async update(id: number, dto: UpdateBuildingDto) {
    return await this.kysely.db
      .updateTable('building')
      .set(dto)
      .where('id', '=', id)
      .execute();
  }

  async remove(id: number) {
    return await this.kysely.db
      .deleteFrom('building')
      .where('id', '=', id)
      .execute();
  }
}
