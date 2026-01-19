import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Property } from '../kysely/database';
import { StoredFileService } from '../stored-file/stored-file.service';
import { PropertyService } from './property.service';
import {
  CreatePropertyDto,
  PropertyListItem,
  UpdatePropertyDto,
} from './types';

@Controller('properties')
export class PropertyController {
  constructor(
    private readonly propertyService: PropertyService,
    private readonly storedFileService: StoredFileService,
  ) {}

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

  @Post(':id/declaration-of-division')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }),
  )
  async uploadDeclarationOfDivision(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile()
    file:
      | { originalname: string; mimetype: string; size: number; buffer: Buffer }
      | undefined,
  ): Promise<Property> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const { declarationOfDivisionFileId: existingDeclarationOfDivisionFileId } =
      await this.propertyService.findOne(id);

    const storedFile = await this.storedFileService.create({
      originalName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      content: file.buffer,
    });

    const updated = await this.propertyService.update(id, {
      declarationOfDivisionFileId: storedFile.id,
    });

    if (existingDeclarationOfDivisionFileId) {
      await this.storedFileService.remove(existingDeclarationOfDivisionFileId);
    }

    return updated;
  }

  @Delete(':id/declaration-of-division')
  async removeDeclarationOfDivision(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Property> {
    const { declarationOfDivisionFileId: existingDeclarationOfDivisionFileId } =
      await this.propertyService.findOne(id);

    if (existingDeclarationOfDivisionFileId) {
      await this.storedFileService.remove(existingDeclarationOfDivisionFileId);
    }

    return await this.propertyService.update(id, {
      declarationOfDivisionFileId: null,
    });
  }
}
