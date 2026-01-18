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
  Query,
} from '@nestjs/common';
import { Building } from '../kysely/database';
import { BuildingService } from './building.service';
import { CreateBuildingDto } from './dto/create-building.dto';
import { ListBuildingsQueryDto } from './dto/list-buildings.query.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';

@Controller('buildings')
export class BuildingController {
  constructor(private readonly buildingService: BuildingService) {}

  @Post()
  async create(@Body() dto: CreateBuildingDto): Promise<Building> {
    return await this.buildingService.create(dto);
  }

  @Get()
  async findAll(@Query() query: ListBuildingsQueryDto): Promise<Building[]> {
    return await this.buildingService.findAll(query.propertyId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Building> {
    return await this.buildingService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBuildingDto,
  ): Promise<Building> {
    return await this.buildingService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.buildingService.remove(id);
  }
}
