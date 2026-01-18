import { z } from 'zod';

const TZippopotamPlace = z.object({
  'place name': z.string(),
});

const TZippopotamResponse = z.object({
  country: z.string(),
  'country abbreviation': z.string(),
  places: z.array(TZippopotamPlace).min(1),
});

export type ZippopotamLookupResult = {
  countryName: string;
  countryCode: string;
  city: string;
  placeCount: number;
};

export async function lookupPostalCode(args: {
  countryCode: string;
  postalCode: string;
  signal?: AbortSignal;
}): Promise<ZippopotamLookupResult | null> {
  const countryCode = args.countryCode.trim().toUpperCase();
  const postalCode = args.postalCode.trim();
  if (!countryCode || !postalCode) return null;

  const url = new URL('https://api.zippopotam.us/');
  url.pathname = `/${encodeURIComponent(countryCode)}/${encodeURIComponent(postalCode)}`;

  const res = await fetch(url, { signal: args.signal });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Postal lookup failed (${res.status})`);

  const json = await res.json();
  const parsed = TZippopotamResponse.safeParse(json);
  if (!parsed.success) return null;

  const first = parsed.data.places[0];
  return {
    countryName: parsed.data.country,
    countryCode: parsed.data['country abbreviation'],
    city: first['place name'],
    placeCount: parsed.data.places.length,
  };
}

