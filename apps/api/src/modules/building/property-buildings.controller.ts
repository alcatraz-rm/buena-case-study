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
import type { Building } from '../kysely/database';
import { BuildingService } from './building.service';
import { CreateBuildingUnderPropertyDto } from './dto/create-building-under-property.dto';
import { UpdateBuildingUnderPropertyDto } from './dto/update-building-under-property.dto';

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

  @Patch(':buildingId')
  async update(
    @Param('buildingId', ParseIntPipe) buildingId: number,
    @Body() dto: UpdateBuildingUnderPropertyDto,
  ): Promise<Building> {
    return await this.buildingService.update(buildingId, dto);
  }

  @Delete(':buildingId')
  @HttpCode(204)
  async remove(
    @Param('buildingId', ParseIntPipe) buildingId: number,
  ): Promise<void> {
    await this.buildingService.remove(buildingId);
  }
}
