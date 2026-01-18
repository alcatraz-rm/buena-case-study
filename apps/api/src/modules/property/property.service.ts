import { Injectable } from '@nestjs/common';
import { KyselyService } from '../kysely/kysely.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { Property } from '../kysely/database';

@Injectable()
export class PropertyService {
  constructor(private readonly kysely: KyselyService) {}

  async create(dto: CreatePropertyDto): Promise<void> {
    await this.kysely.db.insertInto('property').values(dto).execute();
  }

  async findAll(): Promise<Property[]> {
    return await this.kysely.db.selectFrom('property').selectAll().execute();
  }

  async findOne(id: number): Promise<Property | undefined> {
    return await this.kysely.db
      .selectFrom('property')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  async update(id: number, dto: UpdatePropertyDto): Promise<void> {
    await this.kysely.db
      .updateTable('property')
      .set(dto)
      .where('id', '=', id)
      .execute();
  }

  async remove(id: number): Promise<void> {
    await this.kysely.db.deleteFrom('property').where('id', '=', id).execute();
  }
}
