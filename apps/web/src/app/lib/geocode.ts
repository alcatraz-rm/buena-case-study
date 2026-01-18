import { z } from 'zod';

const TAddressSuggestion = z.object({
  label: z.string(),
  street: z.string(),
  houseNumber: z.string(),
  postalCode: z.string(),
  city: z.string(),
  countryCode: z.string(),
  lat: z.string(),
  lon: z.string(),
});

const TAddressSuggestionList = z.array(TAddressSuggestion);

export type AddressSuggestion = z.infer<typeof TAddressSuggestion>;

export async function suggestAddresses(args: {
  apiBaseUrl: string;
  countryCode: string;
  q: string;
  signal?: AbortSignal;
}): Promise<AddressSuggestion[]> {
  const url = new URL('/geocode/addresses', args.apiBaseUrl);
  url.searchParams.set('countryCode', args.countryCode);
  url.searchParams.set('q', args.q);

  const res = await fetch(url, { cache: 'no-store', signal: args.signal });
  if (!res.ok) return [];

  const json: unknown = await res.json();
  const parsed = TAddressSuggestionList.safeParse(json);
  return parsed.success ? parsed.data : [];
}

