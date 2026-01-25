import type { AddressSuggestion } from '@buena/types';
import { AddressSuggestionSchema } from '@buena/types';

const TAddressSuggestionList = AddressSuggestionSchema.array();

export async function suggestAddresses(args: {
  apiBaseUrl: string;
  countryCode: string;
  query: string;
  signal?: AbortSignal;
}): Promise<AddressSuggestion[]> {
  const url = new URL('/geocode/addresses', args.apiBaseUrl);
  url.searchParams.set('countryCode', args.countryCode);
  url.searchParams.set('query', args.query);

  const res = await fetch(url, { cache: 'no-store', signal: args.signal });
  if (!res.ok) {
    return [];
  }

  const json: unknown = await res.json();
  const parsed = TAddressSuggestionList.safeParse(json);

  if (!parsed.success) {
    return [];
  }
  return parsed.data;
}
