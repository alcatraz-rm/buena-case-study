import { TCreateProperty, TUpdateProperty } from '@buena/shared';
import { createZodDto } from 'nestjs-zod';
import type { Property } from '../kysely/database';

export class CreatePropertyDto extends createZodDto(TCreateProperty) {}

export class UpdatePropertyDto extends createZodDto(TUpdateProperty) {}

export type PropertyListItem = Property & { buildingCount: number };
