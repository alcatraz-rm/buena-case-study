import { createZodDto } from 'nestjs-zod';
import { TCreateUnitBase } from './base-unit.schema';

export const TCreateUnitUnderBuilding = TCreateUnitBase;

export class CreateUnitUnderBuildingDto extends createZodDto(
  TCreateUnitUnderBuilding,
) {}
