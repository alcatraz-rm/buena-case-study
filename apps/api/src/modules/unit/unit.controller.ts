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
import { BuildingUnit } from '../kysely/database';
import { CreateUnitDto } from './dto/create-unit.dto';
import { ListUnitsQueryDto } from './dto/list-units.query.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { UnitService } from './unit.service';

@Controller('units')
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  @Post()
  async create(@Body() dto: CreateUnitDto): Promise<BuildingUnit> {
    return await this.unitService.create(dto);
  }

  @Get()
  async findAll(@Query() query: ListUnitsQueryDto): Promise<BuildingUnit[]> {
    return await this.unitService.findAll(query.buildingId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<BuildingUnit> {
    return await this.unitService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUnitDto,
  ): Promise<BuildingUnit> {
    return await this.unitService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.unitService.remove(id);
  }
}
