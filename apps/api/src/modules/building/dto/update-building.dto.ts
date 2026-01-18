import { createZodDto } from 'nestjs-zod';
import { TCreateBuilding } from './create-building.dto';

export const TUpdateBuilding = TCreateBuilding.partial();

export class UpdateBuildingDto extends createZodDto(TUpdateBuilding) {}
