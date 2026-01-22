import { Controller, Get } from '@nestjs/common';
import { AccountantService } from './accountant.service';
import { Accountant } from './types';

@Controller('accountants')
export class AccountantController {
  constructor(private readonly service: AccountantService) {}

  @Get()
  async findAll(): Promise<Accountant[]> {
    return await this.service.findAll();
  }
}
