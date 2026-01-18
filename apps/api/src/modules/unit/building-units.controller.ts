import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import type { BuildingUnit } from '../kysely/database';
import { CreateUnitUnderBuildingDto } from './dto/create-unit-under-building.dto';
import { UnitService } from './unit.service';

@Controller('buildings/:buildingId/units')
export class BuildingUnitsController {
  constructor(private readonly unitService: UnitService) {}

  @Get()
  async list(
    @Param('buildingId', ParseIntPipe) buildingId: number,
  ): Promise<BuildingUnit[]> {
    return await this.unitService.findAll(buildingId);
  }

  @Post()
  async create(
    @Param('buildingId', ParseIntPipe) buildingId: number,
    @Body() dto: CreateUnitUnderBuildingDto,
  ): Promise<BuildingUnit> {
    return await this.unitService.create({ ...dto, buildingId });
  }
}
