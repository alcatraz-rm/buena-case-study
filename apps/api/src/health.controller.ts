import { Controller, Get } from '@nestjs/common';
import { KyselyService } from './modules/kysely/kysely.service';

@Controller('health')
export class HealthController {
  constructor(private readonly kysely: KyselyService) {}

  @Get()
  async health(): Promise<{ ok: true }> {
    await this.kysely.db
      .selectFrom('manager')
      .select(['manager.id'])
      .limit(1)
      .execute();

    return { ok: true };
  }
}
