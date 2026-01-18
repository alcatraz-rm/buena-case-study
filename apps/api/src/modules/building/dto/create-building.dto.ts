import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const TCreateBuidling = z.object({
  propertyId: z.number().int().positive(),
  name: z.string(),
  street: z.string(),
  houseNumber: z.string(),
  postalCode: z.string(),
  city: z.string(),
  country: z.string(),
});

export class CreateBuildingDto extends createZodDto(TCreateBuidling) {}
