import { TGeocodeAddressQuery } from '@buena/shared';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const TNominatimItem = z.object({
  lat: z.string(),
  lon: z.string(),
  display_name: z.string(),
  address: z.object({
    road: z.string().optional(),
    pedestrian: z.string().optional(),
    house_number: z.string().optional(),
    postcode: z.string().optional(),
    city: z.string().optional(),
    town: z.string().optional(),
    village: z.string().optional(),
    hamlet: z.string().optional(),
  }),
});

export const TNominatimResponse = z.array(TNominatimItem);

export class GeocodeAddressQueryDto extends createZodDto(
  TGeocodeAddressQuery,
) {}

export type { AddressSuggestion } from '@buena/shared';
