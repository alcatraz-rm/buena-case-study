import type { AddressSuggestion } from '@buena/shared';
import { AddressSuggestionSchema } from '@buena/shared';

const TAddressSuggestionList = AddressSuggestionSchema.array();

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

