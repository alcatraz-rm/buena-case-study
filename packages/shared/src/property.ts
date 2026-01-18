import { z } from 'zod';

export const ManagementTypeSchema = z.enum(['WEG', 'MV']);
export type ManagementType = z.infer<typeof ManagementTypeSchema>;

export const TCreateProperty = z.object({
  name: z.string(),
  managementType: ManagementTypeSchema,
  managerId: z.number().int().positive(),
  accountantId: z.number().int().positive(),
});

export const TUpdateProperty = TCreateProperty.partial();

export type CreatePropertyDto = z.infer<typeof TCreateProperty>;
export type UpdatePropertyDto = z.infer<typeof TUpdateProperty>;

// API response shapes (JSON-serialized)
export type PersonOption = {
  id: number;
  name: string;
  email: string;
};

export type Property = {
  id: number;
  name: string;
  managementType: ManagementType;
  managerId: number;
  accountantId: number;
  createdAt: string;
  updatedAt: string;
};

export type PropertyListItem = Property & { buildingCount: number };
