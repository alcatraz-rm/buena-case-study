import { Controller, Get } from '@nestjs/common';
import type { Accountant } from '../kysely/database';
import { AccountantService } from './accountant.service';

@Controller('accountants')
export class AccountantController {
  constructor(private readonly service: AccountantService) {}

  @Get()
  async findAll(): Promise<Pick<Accountant, 'id' | 'name' | 'email'>[]> {
    return await this.service.findAll();
  }
}
