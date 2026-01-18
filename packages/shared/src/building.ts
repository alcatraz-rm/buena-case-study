import { z } from 'zod';
import { OptionalPositiveInt } from './utils';

export const TCreateBuildingBase = z.object({
  name: z.string(),
  street: z.string(),
  houseNumber: z.string(),
  postalCode: z.string(),
  city: z.string(),
  country: z.string(),
});

export const TCreateBuilding = z
  .object({
    propertyId: z.number().int().positive(),
  })
  .extend(TCreateBuildingBase.shape);

export const TCreateBuildingUnderProperty = TCreateBuildingBase;
export const TUpdateBuildingUnderProperty = TCreateBuildingBase.partial();

export const TListBuildingsQuery = z.object({
  propertyId: OptionalPositiveInt,
});

export type CreateBuildingDto = z.infer<typeof TCreateBuilding>;
export type CreateBuildingUnderPropertyDto = z.infer<
  typeof TCreateBuildingUnderProperty
>;
export type UpdateBuildingUnderPropertyDto = z.infer<
  typeof TUpdateBuildingUnderProperty
>;
export type ListBuildingsQueryDto = z.infer<typeof TListBuildingsQuery>;

