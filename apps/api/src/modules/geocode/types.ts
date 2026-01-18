import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const TGeocodeAddressQuery = z.object({
  q: z.string().min(2).max(200),
  countryCode: z
    .string()
    .min(2)
    .max(2)
    .transform((s) => s.toUpperCase()),
});

export class GeocodeAddressQueryDto extends createZodDto(
  TGeocodeAddressQuery,
) {}

export type AddressSuggestion = {
  label: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  countryCode: string;
  lat: string;
  lon: string;
};
