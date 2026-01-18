import { createZodDto } from 'nestjs-zod';
import { TCreateProperty } from './create-property.dto';

export const TUpdateProperty = TCreateProperty.partial();

export class UpdatePropertyDto extends createZodDto(TUpdateProperty) {}
