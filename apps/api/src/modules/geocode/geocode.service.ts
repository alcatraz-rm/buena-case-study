import { Injectable } from '@nestjs/common';
import { TNominatimResponse, type AddressSuggestion } from './types';

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36';

type CacheValue = { expiresAt: number; value: AddressSuggestion[] };

@Injectable()
export class GeocodeService {
  private readonly cache = new Map<string, CacheValue>();

  async suggestAddresses(args: {
    q: string;
    countryCode: string;
  }): Promise<AddressSuggestion[]> {
    const q = args.q.trim();
    const countryCode = args.countryCode.trim().toLowerCase();
    const key = `${countryCode}|${q}`;

    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached.value;

    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('limit', '7');
    url.searchParams.set('countrycodes', countryCode);
    url.searchParams.set('q', q);

    const res = await fetch(url, {
      headers: {
        'user-agent': USER_AGENT,
        accept: 'application/json',
      },
    });

    if (!res.ok) return [];

    const json: unknown = await res.json();
    const parsed = TNominatimResponse.safeParse(json);
    if (!parsed.success) return [];

    const suggestionsRaw: AddressSuggestion[] = parsed.data
      .map((it) => {
        const street = it.address.road ?? it.address.pedestrian ?? '';
        const houseNumber = it.address.house_number ?? '';
        const postalCode = it.address.postcode ?? '';
        const city =
          it.address.city ??
          it.address.town ??
          it.address.village ??
          it.address.hamlet ??
          '';

        if (!street || !postalCode || !city) return null;

        const label = `${street}${houseNumber ? ` ${houseNumber}` : ''}, ${postalCode} ${city}`;

        return {
          label,
          street,
          houseNumber,
          postalCode,
          city,
          countryCode: countryCode.toUpperCase(),
          lat: it.lat,
          lon: it.lon,
        };
      })
      .filter((x): x is AddressSuggestion => x !== null);

    const seen = new Set<string>();
    const suggestions = suggestionsRaw.filter((s) => {
      const key = [
        s.countryCode.toUpperCase(),
        s.postalCode.trim().toLowerCase(),
        s.city.trim().toLowerCase(),
        s.street.trim().toLowerCase(),
        s.houseNumber.trim().toLowerCase(),
      ].join('|');

      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    this.cache.set(key, { value: suggestions, expiresAt: Date.now() + 60_000 });
    return suggestions;
  }
}
