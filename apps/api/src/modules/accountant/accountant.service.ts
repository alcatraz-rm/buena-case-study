import { Injectable } from '@nestjs/common';
import type { Accountant } from '../kysely/database';
import { KyselyService } from '../kysely/kysely.service';

@Injectable()
export class AccountantService {
  constructor(private readonly kysely: KyselyService) {}

  async findAll(): Promise<Pick<Accountant, 'id' | 'name' | 'email'>[]> {
    return await this.kysely.db
      .selectFrom('accountant')
      .selectAll()
      .where('accountant.deletedAt', 'is', null)
      .orderBy('accountant.name', 'asc')
      .execute();
  }
}
