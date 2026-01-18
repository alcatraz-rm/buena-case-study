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
import { Property } from '../kysely/database';
import { PropertyService } from './property.service';
import {
  CreatePropertyDto,
  PropertyListItem,
  UpdatePropertyDto,
} from './types';

@Controller('properties')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post()
  async create(@Body() dto: CreatePropertyDto): Promise<Property> {
    return await this.propertyService.create(dto);
  }

  @Get()
  async findAll(): Promise<PropertyListItem[]> {
    return await this.propertyService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Property> {
    return await this.propertyService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePropertyDto,
  ): Promise<Property> {
    return await this.propertyService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.propertyService.remove(id);
  }
}
