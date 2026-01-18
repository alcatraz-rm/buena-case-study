import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import { OptionalPositiveInt } from '~/lib/zod-utils';

const TCreateUnitBase = z.object({
  unitType: z.enum(['Apartment', 'Office', 'Garden', 'Parking']),
  number: z.string(),
  floor: z.string().nullable().optional(),
  entrance: z.string().nullable().optional(),
  sizeSqm: z.number().positive().nullable().optional(),
  coOwnershipShare: z.string().nullable().optional(),
  constructionYear: z.number().int().nullable().optional(),
  rooms: z.number().positive().nullable().optional(),
});

export const TCreateUnit = z
  .object({
    buildingId: z.number().int().positive(),
  })
  .extend(TCreateUnitBase.shape);

export class CreateUnitDto extends createZodDto(TCreateUnit) {}

export const TCreateUnitUnderBuilding = TCreateUnitBase;
export class CreateUnitUnderBuildingDto extends createZodDto(
  TCreateUnitUnderBuilding,
) {}

export const TUpdateUnitUnderBuilding = TCreateUnitBase.partial();
export class UpdateUnitUnderBuildingDto extends createZodDto(
  TUpdateUnitUnderBuilding,
) {}

export const TListUnitsQuery = z.object({
  buildingId: OptionalPositiveInt,
});
export class ListUnitsQueryDto extends createZodDto(TListUnitsQuery) {}
