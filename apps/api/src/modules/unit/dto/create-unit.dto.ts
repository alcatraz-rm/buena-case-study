import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { TCreateUnitBase } from './base-unit.schema';

export const TCreateUnit = z
  .object({
    buildingId: z.number().int().positive(),
  })
  .extend(TCreateUnitBase.shape);

export class CreateUnitDto extends createZodDto(TCreateUnit) {}
