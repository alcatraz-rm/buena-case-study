import { Injectable } from '@nestjs/common';
import { KyselyService } from '../kysely/kysely.service';
import type { Manager } from './types';

@Injectable()
export class ManagerService {
  constructor(private readonly kysely: KyselyService) {}

  async findAll(): Promise<Manager[]> {
    return await this.kysely.db
      .selectFrom('manager')
      .selectAll()
      .where('manager.deletedAt', 'is', null)
      .orderBy('manager.name', 'asc')
      .execute();
  }
}
