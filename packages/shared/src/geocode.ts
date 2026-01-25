import { z } from 'zod';

export const TGeocodeAddressQuery = z.object({
  query: z.string().min(2).max(200),
  countryCode: z
    .string()
    .min(2)
    .max(2)
    .transform((s) => s.toUpperCase()),
});

export type GeocodeAddressQueryDto = z.infer<typeof TGeocodeAddressQuery>;

export const AddressSuggestionSchema = z.object({
  label: z.string(),
  street: z.string(),
  houseNumber: z.string(),
  postalCode: z.string(),
  city: z.string(),
  countryCode: z.string(),
  lat: z.string(),
  lon: z.string(),
});

export type AddressSuggestion = z.infer<typeof AddressSuggestionSchema>;
