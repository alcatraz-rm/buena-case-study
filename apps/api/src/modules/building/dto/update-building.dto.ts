import { createZodDto } from 'nestjs-zod';
import { TCreateBuidling } from './create-building.dto';

export const TUpdateBuidling = TCreateBuidling.partial();

export class UpdateBuildingDto extends createZodDto(TUpdateBuidling) {}
