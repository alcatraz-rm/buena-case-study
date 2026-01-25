import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { TNominatimResponse, type AddressSuggestion } from './types';

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36';

const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org/search';

const CACHE_TTL_SECONDS = 60;

@Injectable()
export class GeocodeService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async suggestAddresses(args: {
    query: string;
    countryCode: string;
  }): Promise<AddressSuggestion[]> {
    const query = args.query.trim();
    const countryCode = args.countryCode.trim().toLowerCase();
    const key = `${countryCode}|${query}`;

    const cached = await this.cache.get<AddressSuggestion[]>(key);
    if (cached) return cached;

    const url = new URL(NOMINATIM_API_URL);
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('limit', '7');
    url.searchParams.set('countrycodes', countryCode);
    url.searchParams.set('q', query);

    const response = await fetch(url, {
      headers: {
        'user-agent': USER_AGENT,
        accept: 'application/json',
      },
    });

    if (!response.ok) {
      return [];
    }

    const json: unknown = await response.json();
    const parsed = TNominatimResponse.safeParse(json);
    if (!parsed.success) {
      return [];
    }

    const suggestionsRaw: AddressSuggestion[] = parsed.data
      .map((suggestion) => {
        const street =
          suggestion.address.road ?? suggestion.address.pedestrian ?? '';
        const houseNumber = suggestion.address.house_number ?? '';
        const postalCode = suggestion.address.postcode ?? '';
        const city =
          suggestion.address.city ??
          suggestion.address.town ??
          suggestion.address.village ??
          suggestion.address.hamlet ??
          '';

        if (!street || !postalCode || !city) {
          return null;
        }

        const label = `${street}${houseNumber ? ` ${houseNumber}` : ''}, ${postalCode} ${city}`;

        return {
          label,
          street,
          houseNumber,
          postalCode,
          city,
          countryCode: countryCode.toUpperCase(),
          lat: suggestion.lat,
          lon: suggestion.lon,
        };
      })
      .filter(
        (suggestion): suggestion is AddressSuggestion => suggestion !== null,
      );

    const seen = new Set<string>();
    const suggestions = suggestionsRaw.filter((suggestion) => {
      const key = [
        suggestion.countryCode.toUpperCase(),
        suggestion.postalCode.trim().toLowerCase(),
        suggestion.city.trim().toLowerCase(),
        suggestion.street.trim().toLowerCase(),
        suggestion.houseNumber.trim().toLowerCase(),
      ].join('|');

      if (seen.has(key)) {
        return false;
      }
      seen.add(key);

      return true;
    });

    await this.cache.set(key, suggestions, CACHE_TTL_SECONDS);
    return suggestions;
  }
}
