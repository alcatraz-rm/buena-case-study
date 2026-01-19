import {
  TCreateBuilding,
  TCreateBuildingUnderProperty,
  TListBuildingsQuery,
  TUpdateBuildingUnderProperty,
} from '@buena/shared';
import { createZodDto } from 'nestjs-zod';

export class CreateBuildingDto extends createZodDto(TCreateBuilding) {}

export class CreateBuildingUnderPropertyDto extends createZodDto(
  TCreateBuildingUnderProperty,
) {}

export class UpdateBuildingUnderPropertyDto extends createZodDto(
  TUpdateBuildingUnderProperty,
) {}

export class ListBuildingsQueryDto extends createZodDto(TListBuildingsQuery) {}
