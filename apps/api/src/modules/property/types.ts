import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { Property } from '../kysely/database';

export const TCreateProperty = z.object({
  name: z.string(),
  managementType: z.enum(['WEG', 'MV']),
  managerId: z.number().int().positive(),
  accountantId: z.number().int().positive(),
});

export class CreatePropertyDto extends createZodDto(TCreateProperty) {}

export const TUpdateProperty = TCreateProperty.partial();
export class UpdatePropertyDto extends createZodDto(TUpdateProperty) {}

export type PropertyListItem = Property & { buildingCount: number };
