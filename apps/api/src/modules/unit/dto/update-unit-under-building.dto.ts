import { createZodDto } from 'nestjs-zod';
import { TCreateUnitBase } from './base-unit.schema';

export const TUpdateUnitUnderBuilding = TCreateUnitBase.partial();

export class UpdateUnitUnderBuildingDto extends createZodDto(
  TUpdateUnitUnderBuilding,
) {}
