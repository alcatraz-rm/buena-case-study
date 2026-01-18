import { z } from 'zod';

export const TCreateBuildingBase = z.object({
  name: z.string(),
  street: z.string(),
  houseNumber: z.string(),
  postalCode: z.string(),
  city: z.string(),
  country: z.string(),
});
