import { createZodDto } from 'nestjs-zod';
import { TCreateUnit } from './create-unit.dto';

export const TUpdateUnit = TCreateUnit.partial();

export class UpdateUnitDto extends createZodDto(TUpdateUnit) {}
