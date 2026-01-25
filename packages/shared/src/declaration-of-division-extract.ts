import { z } from 'zod';
import { ManagementTypeSchema } from './property';
import { BuildingUnitTypeSchema } from './unit';

// These schemas are for LLM extraction output

export const ExtractedUnitSchema = z
  .object({
    unitType: BuildingUnitTypeSchema.nullable(),
    floor: z.string().nullable(),
    number: z.string().nullable(),
    description: z.string().nullable(),
    entrance: z.string().nullable(),
    sizeSqm: z.number().nullable(),
    coOwnershipShare: z.string().nullable(),
    constructionYear: z.number().int().nullable(),
    rooms: z.number().nullable(),
  })
  .strict();

export const ExtractedBuildingSchema = z
  .object({
    name: z.string().nullable(),
    street: z.string().nullable(),
    houseNumber: z.string().nullable(),
    postalCode: z.string().nullable(),
    city: z.string().nullable(),
    country: z.string().nullable(),
    units: z.array(ExtractedUnitSchema),
  })
  .strict();

export const ExtractedPropertySchema = z
  .object({
    name: z.string().nullable(),
    managementType: ManagementTypeSchema.nullable(),
    buildings: z.array(ExtractedBuildingSchema),
  })
  .strict();

export const DeclarationOfDivisionExtractionSchema = z.object({
  properties: z.array(ExtractedPropertySchema),
});

export type DeclarationOfDivisionExtraction = z.infer<
  typeof DeclarationOfDivisionExtractionSchema
>;
