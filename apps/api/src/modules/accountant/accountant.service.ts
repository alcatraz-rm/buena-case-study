import { Injectable } from '@nestjs/common';
import type { Accountant } from '../kysely/database';
import { KyselyService } from '../kysely/kysely.service';

@Injectable()
export class AccountantService {
  constructor(private readonly kysely: KyselyService) {}

  async findAll(): Promise<Pick<Accountant, 'id' | 'name' | 'email'>[]> {
    return await this.kysely.db
      .selectFrom('accountant')
      .select(['id', 'name', 'email'])
      .where('deletedAt', 'is', null)
      .orderBy('name', 'asc')
      .execute();
  }
}
