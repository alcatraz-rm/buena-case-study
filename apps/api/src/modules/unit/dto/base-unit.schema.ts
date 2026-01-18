import { z } from 'zod';

export const TCreateUnitBase = z.object({
  unitType: z.enum(['Apartment', 'Office', 'Garden', 'Parking']),
  number: z.string(),
  floor: z.string().nullable().optional(),
  entrance: z.string().nullable().optional(),
  sizeSqm: z.number().positive().nullable().optional(),
  coOwnershipShare: z.string().nullable().optional(),
  constructionYear: z.number().int().nullable().optional(),
  rooms: z.number().positive().nullable().optional(),
});
