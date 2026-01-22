import { Controller, Get } from '@nestjs/common';
import { ManagerService } from './manager.service';
import type { Manager } from './types';

@Controller('managers')
export class ManagerController {
  constructor(private readonly service: ManagerService) {}

  @Get()
  async findAll(): Promise<Manager[]> {
    return await this.service.findAll();
  }
}
