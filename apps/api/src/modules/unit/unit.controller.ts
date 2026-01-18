import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { BuildingUnit } from '../kysely/database';
import { ListUnitsQueryDto } from './types';
import { UnitService } from './unit.service';

@Controller('units')
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  @Get()
  async findAll(@Query() query: ListUnitsQueryDto): Promise<BuildingUnit[]> {
    return await this.unitService.findAll(query.buildingId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<BuildingUnit> {
    return await this.unitService.findOne(id);
  }
}
