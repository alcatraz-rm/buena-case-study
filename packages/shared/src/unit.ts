import { z } from 'zod';
import { OptionalPositiveInt } from './utils';

export const BuildingUnitTypeSchema = z.enum([
  'Apartment',
  'Office',
  'Garden',
  'Parking',
]);

export const TCreateUnitBase = z.object({
  unitType: BuildingUnitTypeSchema,
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

export const TCreateUnitUnderBuilding = TCreateUnitBase;
export const TUpdateUnitUnderBuilding = TCreateUnitBase.partial();

export const TListUnitsQuery = z.object({
  buildingId: OptionalPositiveInt,
});

export type CreateUnitDto = z.infer<typeof TCreateUnit>;
export type CreateUnitUnderBuildingDto = z.infer<typeof TCreateUnitUnderBuilding>;
export type UpdateUnitUnderBuildingDto = z.infer<typeof TUpdateUnitUnderBuilding>;
export type ListUnitsQueryDto = z.infer<typeof TListUnitsQuery>;

