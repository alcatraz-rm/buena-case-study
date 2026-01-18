import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import type { Building } from '../kysely/database';
import { BuildingService } from './building.service';
import { CreateBuildingUnderPropertyDto } from './dto/create-building-under-property.dto';

@Controller('properties/:propertyId/buildings')
export class PropertyBuildingsController {
  constructor(private readonly buildingService: BuildingService) {}

  @Get()
  async list(
    @Param('propertyId', ParseIntPipe) propertyId: number,
  ): Promise<Building[]> {
    return await this.buildingService.findAll(propertyId);
  }

  @Post()
  async create(
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Body() dto: CreateBuildingUnderPropertyDto,
  ): Promise<Building> {
    return await this.buildingService.create({
      ...dto,
      propertyId,
    });
  }
}
