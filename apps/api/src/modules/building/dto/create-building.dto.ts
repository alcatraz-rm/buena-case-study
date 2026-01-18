import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { TCreateBuildingBase } from './base-building.schema';

export const TCreateBuilding = z
  .object({
    propertyId: z.number().int().positive(),
  })
  .extend(TCreateBuildingBase.shape);

export class CreateBuildingDto extends createZodDto(TCreateBuilding) {}
