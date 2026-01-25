import {
  TCreateUnit,
  TCreateUnitUnderBuilding,
  TListUnitsQuery,
  TUpdateUnitUnderBuilding,
} from '@buena/types';
import { createZodDto } from 'nestjs-zod';

export class CreateUnitDto extends createZodDto(TCreateUnit) {}

export class CreateUnitUnderBuildingDto extends createZodDto(
  TCreateUnitUnderBuilding,
) {}

export class UpdateUnitUnderBuildingDto extends createZodDto(
  TUpdateUnitUnderBuilding,
) {}

export class ListUnitsQueryDto extends createZodDto(TListUnitsQuery) {}
