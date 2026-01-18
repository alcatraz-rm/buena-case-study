import { z } from 'zod';

export const ManagementTypeSchema = z.enum(['WEG', 'MV']);

export const TCreateProperty = z.object({
  name: z.string(),
  managementType: ManagementTypeSchema,
  managerId: z.number().int().positive(),
  accountantId: z.number().int().positive(),
});

export const TUpdateProperty = TCreateProperty.partial();

export type CreatePropertyDto = z.infer<typeof TCreateProperty>;
export type UpdatePropertyDto = z.infer<typeof TUpdateProperty>;

