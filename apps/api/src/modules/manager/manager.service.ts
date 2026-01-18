import { Injectable } from '@nestjs/common';
import type { Manager } from '../kysely/database';
import { KyselyService } from '../kysely/kysely.service';

@Injectable()
export class ManagerService {
  constructor(private readonly kysely: KyselyService) {}

  async findAll(): Promise<Pick<Manager, 'id' | 'name' | 'email'>[]> {
    return await this.kysely.db
      .selectFrom('manager')
      .selectAll()
      .where('manager.deletedAt', 'is', null)
      .orderBy('manager.name', 'asc')
      .execute();
  }
}
