import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import type { BuildingUnit } from '../kysely/database';
import {
  CreateUnitUnderBuildingDto,
  UpdateUnitUnderBuildingDto,
} from './types';
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

  @Patch(':unitId')
  async update(
    @Param('buildingId', ParseIntPipe) buildingId: number,
    @Param('unitId', ParseIntPipe) unitId: number,
    @Body() dto: UpdateUnitUnderBuildingDto,
  ): Promise<BuildingUnit> {
    return await this.unitService.update(unitId, buildingId, dto);
  }

  @Delete(':unitId')
  @HttpCode(204)
  async remove(
    @Param('buildingId', ParseIntPipe) buildingId: number,
    @Param('unitId', ParseIntPipe) unitId: number,
  ): Promise<void> {
    await this.unitService.remove(unitId, buildingId);
  }
}
