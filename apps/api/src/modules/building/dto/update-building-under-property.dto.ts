import { createZodDto } from 'nestjs-zod';
import { TCreateBuildingBase } from './base-building.schema';

export const TUpdateBuildingUnderProperty = TCreateBuildingBase.partial();

export class UpdateBuildingUnderPropertyDto extends createZodDto(
  TUpdateBuildingUnderProperty,
) {}
