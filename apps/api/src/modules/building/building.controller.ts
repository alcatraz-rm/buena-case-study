import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { Building } from '../kysely/database';
import { BuildingService } from './building.service';
import { ListBuildingsQueryDto } from './types';

@Controller('buildings')
export class BuildingController {
  constructor(private readonly buildingService: BuildingService) {}

  @Get()
  async findAll(@Query() query: ListBuildingsQueryDto): Promise<Building[]> {
    return await this.buildingService.findAll(query.propertyId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Building> {
    return await this.buildingService.findOne(id);
  }
}
