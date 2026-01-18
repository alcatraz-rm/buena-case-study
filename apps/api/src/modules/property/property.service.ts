import { Injectable, NotFoundException } from '@nestjs/common';
import { Property } from '../kysely/database';
import { KyselyService } from '../kysely/kysely.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

@Injectable()
export class PropertyService {
  constructor(private readonly kysely: KyselyService) {}

  async create(dto: CreatePropertyDto): Promise<void> {
    await this.kysely.db.insertInto('property').values(dto).execute();
  }

  async findAll(): Promise<Property[]> {
    return await this.kysely.db
      .selectFrom('property')
      .selectAll()
      .where('deletedAt', 'is', null)
      .execute();
  }

  async findOne(id: number): Promise<Property> {
    const property = await this.kysely.db
      .selectFrom('property')
      .selectAll()
      .where('id', '=', id)
      .where('deletedAt', 'is', null)
      .executeTakeFirst();

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return property;
  }

  async update(id: number, dto: UpdatePropertyDto): Promise<void> {
    const result = await this.kysely.db
      .updateTable('property')
      .set(dto)
      .where('id', '=', id)
      .where('deletedAt', 'is', null)
      .returningAll()
      .execute();

    if (result.length === 0) {
      throw new NotFoundException('Property not found');
    }
  }

  async remove(id: number): Promise<void> {
    const result = await this.kysely.db
      .updateTable('property')
      .set({ deletedAt: new Date() })
      .where('id', '=', id)
      .where('deletedAt', 'is', null)
      .returningAll()
      .execute();

    if (result.length === 0) {
      throw new NotFoundException('Property not found');
    }
  }
}
