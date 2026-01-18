import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const TCreateProperty = z.object({
  name: z.string(),
  managementType: z.enum(['WEG', 'MV']),
  managerId: z.number().int().positive(),
  accountantId: z.number().int().positive(),
});

export class CreatePropertyDto extends createZodDto(TCreateProperty) {}
