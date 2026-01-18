import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import { OptionalPositiveInt } from '~/lib/zod-utils';

const TCreateBuildingBase = z.object({
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

export class CreateBuildingDto extends createZodDto(TCreateBuilding) {}

export const TCreateBuildingUnderProperty = TCreateBuildingBase;
export class CreateBuildingUnderPropertyDto extends createZodDto(
  TCreateBuildingUnderProperty,
) {}

export const TUpdateBuildingUnderProperty = TCreateBuildingBase.partial();
export class UpdateBuildingUnderPropertyDto extends createZodDto(
  TUpdateBuildingUnderProperty,
) {}

export const TListBuildingsQuery = z.object({
  propertyId: OptionalPositiveInt,
});
export class ListBuildingsQueryDto extends createZodDto(TListBuildingsQuery) {}
