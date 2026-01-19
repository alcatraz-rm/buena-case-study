import { Controller, Get } from '@nestjs/common';
import type { Manager } from '../kysely/database';
import { ManagerService } from './manager.service';

@Controller('managers')
export class ManagerController {
  constructor(private readonly service: ManagerService) {}

  @Get()
  async findAll(): Promise<Pick<Manager, 'id' | 'name' | 'email'>[]> {
    return await this.service.findAll();
  }
}
