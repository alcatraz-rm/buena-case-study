import { createZodDto } from 'nestjs-zod';
import { TCreateBuildingBase } from './base-building.schema';

export const TCreateBuildingUnderProperty = TCreateBuildingBase;

export class CreateBuildingUnderPropertyDto extends createZodDto(
  TCreateBuildingUnderProperty,
) {}
