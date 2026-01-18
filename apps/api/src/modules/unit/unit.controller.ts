import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { BuildingUnit } from '../kysely/database';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { UnitService } from './unit.service';

@Controller('units')
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  @Post()
  async create(@Body() dto: CreateUnitDto): Promise<void> {
    await this.unitService.create(dto);
  }

  @Get()
  async findAll(
    @Query('buildingId') buildingId?: string,
  ): Promise<BuildingUnit[]> {
    return await this.unitService.findAll(
      buildingId ? Number(buildingId) : undefined,
    );
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<BuildingUnit | undefined> {
    return await this.unitService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUnitDto,
  ): Promise<void> {
    await this.unitService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.unitService.remove(id);
  }
}
