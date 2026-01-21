import { DeclarationOfDivisionExtraction } from '@buena/shared';
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
import { PdfTextService } from '../pdf-text/pdf-text.service';
import { StoredFileService } from '../stored-file/stored-file.service';
import { PropertyService } from './property.service';
import {
  CreatePropertyDto,
  PropertyListItem,
  UpdatePropertyDto,
} from './types';

type FileType =
  | { originalname: string; mimetype: string; size: number; buffer: Buffer }
  | undefined;

const FILE_SIZE_LIMIT = 10 * 1024 * 1024;

@Controller('properties')
export class PropertyController {
  constructor(
    private readonly propertyService: PropertyService,
    private readonly storedFileService: StoredFileService,
    private readonly pdfTextService: PdfTextService,
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
    FileInterceptor('file', { limits: { fileSize: FILE_SIZE_LIMIT } }),
  )
  async uploadDeclarationOfDivision(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile()
    file: FileType,
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

  @Post('declaration-of-division/analyze')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: FILE_SIZE_LIMIT } }),
  )
  async analyzeDeclarationOfDivision(
    @UploadedFile() file: FileType,
  ): Promise<DeclarationOfDivisionExtraction> {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Only PDF files are supported');
    }

    return await this.pdfTextService.extractEntitiesFromPdfWithOpenAi(
      file.buffer,
    );
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
