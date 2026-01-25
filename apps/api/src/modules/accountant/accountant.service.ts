import { Injectable } from '@nestjs/common';
import { KyselyService } from '../kysely/kysely.service';
import { Accountant } from './types';

@Injectable()
export class AccountantService {
  constructor(private readonly kysely: KyselyService) {}

  async findAll(): Promise<Accountant[]> {
    return await this.kysely.db
      .selectFrom('accountant')
      .selectAll()
      .where('accountant.deletedAt', 'is', null)
      .orderBy('accountant.name', 'asc')
      .execute();
  }
}
