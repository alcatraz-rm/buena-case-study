'use client';

import type { AddressSuggestion, Building } from '@buena/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { COUNTRY_OPTIONS } from '../lib/countries';
import { suggestAddresses } from '../lib/geocode';

type Props = {
  apiBaseUrl: string;
  propertyId: number;
  initialBuildings: Building[];
  onCountChange?: (count: number) => void;
};

export function PropertyBuildingsPanel({
  apiBaseUrl,
  propertyId,
  initialBuildings,
  onCountChange,
}: Props) {
  const router = useRouter();
  const [buildings, setBuildings] = useState<Building[]>(initialBuildings);

  const [isCreateBuildingOpen, setIsCreateBuildingOpen] = useState(false);
  const [isBuildingCreating, setIsBuildingCreating] = useState(false);
  const [createBuildingError, setCreateBuildingError] = useState<string | null>(
    null,
  );
  const [createCountryCode, setCreateCountryCode] = useState('');
  const [createStreet, setCreateStreet] = useState('');
  const [createHouseNumber, setCreateHouseNumber] = useState('');
  const [createPostalCode, setCreatePostalCode] = useState('');
  const [createCity, setCreateCity] = useState('');
  const [createStreetSuggestions, setCreateStreetSuggestions] = useState<
    AddressSuggestion[]
  >([]);
  const [isCreateSuggesting, setIsCreateSuggesting] = useState(false);
  const [createSuggestAnchor, setCreateSuggestAnchor] = useState<
    'street' | 'houseNumber'
  >('street');
  const [createSuppressSuggestions, setCreateSuppressSuggestions] =
    useState(false);
  const [createStreetFocused, setCreateStreetFocused] = useState(false);
  const [createHouseNumberFocused, setCreateHouseNumberFocused] =
    useState(false);

  useEffect(() => {
    onCountChange?.(buildings.length);
  }, [buildings.length, onCountChange]);

  useEffect(() => {
    if (createSuppressSuggestions) {
      return;
    }
    if (!isCreateBuildingOpen) {
      return;
    }
    if (!createCountryCode || createStreet.trim().length < 3) {
      setCreateStreetSuggestions([]);
      setIsCreateSuggesting(false);

      return;
    }

    const controller = new AbortController();
    setIsCreateSuggesting(true);

    const t = window.setTimeout(async () => {
      const query = `${createStreet}${createHouseNumber.trim() ? ` ${createHouseNumber.trim()}` : ''}`;
      const suggestions = await suggestAddresses({
        apiBaseUrl,
        countryCode: createCountryCode,
        query,
        signal: controller.signal,
      });
      setCreateStreetSuggestions(suggestions);
      setIsCreateSuggesting(false);
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(t);
      setIsCreateSuggesting(false);
    };
  }, [
    apiBaseUrl,
    isCreateBuildingOpen,
    createCountryCode,
    createStreet,
    createHouseNumber,
    createSuppressSuggestions,
  ]);

  async function onCreateBuilding(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreateBuildingError(null);
    setIsBuildingCreating(true);

    try {
      const formData = new FormData(event.currentTarget);

      const name = String(formData.get('name') ?? '').trim();
      const street = String(formData.get('street') ?? '').trim();
      const houseNumber = String(formData.get('houseNumber') ?? '').trim();
      const postalCode = String(formData.get('postalCode') ?? '').trim();
      const city = String(formData.get('city') ?? '').trim();
      const country = String(formData.get('country') ?? '').trim();

      if (!name) {
        throw new Error('Building name is required.');
      }
      if (!street) {
        throw new Error('Street is required.');
      }
      if (!houseNumber) {
        throw new Error('House number is required.');
      }
      if (!postalCode) {
        throw new Error('Postal code is required.');
      }
      if (!city) {
        throw new Error('City is required.');
      }
      if (!country) {
        throw new Error('Country is required.');
      }

      const response = await fetch(
        `${apiBaseUrl}/properties/${propertyId}/buildings`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            name,
            street,
            houseNumber,
            postalCode,
            city,
            country,
          }),
        },
      );

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(
          text || `Failed to create building (${response.status})`,
        );
      }

      const created = (await response.json()) as Building;
      setBuildings((prev) => [created, ...prev]);
      setIsCreateBuildingOpen(false);
      router.refresh();
    } catch (err) {
      setCreateBuildingError(
        err instanceof Error ? err.message : 'Something went wrong.',
      );
    } finally {
      setIsBuildingCreating(false);
    }
  }

  return (
    <>
      <section className="overflow-hidden rounded-xl border border-zinc-800">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-800 bg-zinc-900 px-5 py-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-medium text-zinc-200">Buildings</h2>
            <p className="text-xs text-zinc-400">
              Buildings linked to this property.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100 hover:bg-zinc-800"
            aria-label="Add building"
            onClick={() => {
              setCreateBuildingError(null);
              setCreateCountryCode('');
              setCreateStreet('');
              setCreateHouseNumber('');
              setCreatePostalCode('');
              setCreateCity('');
              setCreateStreetSuggestions([]);
              setCreateSuggestAnchor('street');
              setCreateSuppressSuggestions(false);
              setIsCreateBuildingOpen(true);
            }}
          >
            +
          </button>
        </div>

        <div className="divide-y divide-zinc-900">
          {buildings.map((building) => (
            <div
              key={building.id}
              className="flex flex-col gap-2 px-5 py-4 hover:bg-zinc-900/40 sm:flex-row sm:items-center sm:justify-between"
            >
              <Link
                href={`/properties/${propertyId}/buildings/${building.id}`}
                className="min-w-0 flex-1 rounded-lg p-1 -m-1 hover:bg-zinc-900/30 focus:outline-none focus:ring-2 focus:ring-zinc-700"
              >
                <div className="truncate text-sm font-medium text-zinc-100">
                  {building.name}
                </div>
                <div className="mt-1 truncate text-xs text-zinc-400">
                  {building.street} {building.houseNumber},{' '}
                  {building.postalCode} {building.city}, {building.country}
                </div>
              </Link>
            </div>
          ))}

          {buildings.length === 0 && (
            <div className="px-5 py-10 text-center text-sm text-zinc-400">
              No buildings yet.
            </div>
          )}
        </div>
      </section>

      {isCreateBuildingOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
          <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-900 px-5 py-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-base font-semibold">New building</h2>
                <p className="text-xs text-zinc-400">
                  Add a building to this property.
                </p>
              </div>
            </div>

            <form
              onSubmit={onCreateBuilding}
              className="flex flex-col gap-4 px-5 py-4"
            >
              <div className="grid gap-2">
                <label className="text-sm text-zinc-300" htmlFor="c-country">
                  Country<span className="ml-1 text-red-400">*</span>
                </label>
                <select
                  id="c-country"
                  name="country"
                  value={createCountryCode}
                  onChange={(event) => {
                    setCreateCountryCode(event.target.value);
                  }}
                  className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 pl-3 pr-10 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                  required
                >
                  <option value="" disabled>
                    Select country…
                  </option>
                  {COUNTRY_OPTIONS.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name} ({country.code})
                    </option>
                  ))}
                </select>

                {!createCountryCode && (
                  <div className="text-xs text-zinc-500">
                    Select country to enter the address.
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <label className="text-sm text-zinc-300" htmlFor="c-name">
                  Building name<span className="ml-1 text-red-400">*</span>
                </label>
                <input
                  id="c-name"
                  name="name"
                  className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                  placeholder="e.g. Building A"
                  required
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="relative flex flex-col gap-2">
                  <label className="text-sm text-zinc-300" htmlFor="c-street">
                    Street<span className="ml-1 text-red-400">*</span>
                  </label>
                  <input
                    id="c-street"
                    name="street"
                    value={createStreet}
                    onChange={(event) => {
                      setCreateSuggestAnchor('street');
                      setCreateSuppressSuggestions(false);
                      setCreateStreet(event.target.value);
                    }}
                    onFocus={() => {
                      setCreateSuggestAnchor('street');
                      setCreateStreetFocused(true);
                    }}
                    onBlur={() => setCreateStreetFocused(false)}
                    disabled={!createCountryCode}
                    className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                    placeholder="e.g. Sonnenallee"
                    required
                  />
                  {createSuggestAnchor === 'street' &&
                    createStreetFocused &&
                    (isCreateSuggesting ||
                      createStreetSuggestions.length > 0) && (
                      <div className="absolute left-0 right-0 top-[4.75rem] z-10 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 shadow-xl">
                        {isCreateSuggesting && (
                          <div className="px-3 py-2 text-xs text-zinc-500">
                            Searching…
                          </div>
                        )}
                        {createStreetSuggestions.map((suggestion) => (
                          <button
                            key={`${suggestion.lat}-${suggestion.lon}`}
                            type="button"
                            className="w-full px-3 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-900"
                            onMouseDown={(event) => {
                              event.preventDefault();
                              setCreateStreet(suggestion.street);
                              setCreateHouseNumber(suggestion.houseNumber);
                              setCreatePostalCode(suggestion.postalCode);
                              setCreateCity(suggestion.city);
                              setCreateStreetSuggestions([]);
                              setCreateSuppressSuggestions(true);
                            }}
                          >
                            <div className="truncate">{suggestion.label}</div>
                          </button>
                        ))}
                        {!isCreateSuggesting &&
                          createStreetSuggestions.length === 0 && (
                            <div className="px-3 py-2 text-xs text-zinc-500">
                              No suggestions.
                            </div>
                          )}
                      </div>
                    )}
                </div>
                <div className="relative flex flex-col gap-2">
                  <label
                    className="text-sm text-zinc-300"
                    htmlFor="c-houseNumber"
                  >
                    House number<span className="ml-1 text-red-400">*</span>
                  </label>
                  <input
                    id="c-houseNumber"
                    name="houseNumber"
                    value={createHouseNumber}
                    onChange={(e) => {
                      setCreateSuggestAnchor('houseNumber');
                      setCreateSuppressSuggestions(false);
                      setCreateHouseNumber(e.target.value);
                    }}
                    onFocus={() => {
                      setCreateSuggestAnchor('houseNumber');
                      setCreateHouseNumberFocused(true);
                    }}
                    onBlur={() => setCreateHouseNumberFocused(false)}
                    disabled={!createCountryCode}
                    className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                    placeholder="e.g. 12"
                    required
                  />
                  {createSuggestAnchor === 'houseNumber' &&
                    createHouseNumberFocused &&
                    (isCreateSuggesting ||
                      createStreetSuggestions.length > 0) && (
                      <div className="absolute left-0 right-0 top-[4.75rem] z-10 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 shadow-xl">
                        {isCreateSuggesting && (
                          <div className="px-3 py-2 text-xs text-zinc-500">
                            Searching…
                          </div>
                        )}
                        {createStreetSuggestions.map((suggestion) => (
                          <button
                            key={`${suggestion.lat}-${suggestion.lon}`}
                            type="button"
                            className="w-full px-3 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-900"
                            onMouseDown={(event) => {
                              event.preventDefault();
                              setCreateStreet(suggestion.street);
                              setCreateHouseNumber(suggestion.houseNumber);
                              setCreatePostalCode(suggestion.postalCode);
                              setCreateCity(suggestion.city);
                              setCreateStreetSuggestions([]);
                              setCreateSuppressSuggestions(true);
                            }}
                          >
                            <div className="truncate">{suggestion.label}</div>
                          </button>
                        ))}
                        {!isCreateSuggesting &&
                          createStreetSuggestions.length === 0 && (
                            <div className="px-3 py-2 text-xs text-zinc-500">
                              No suggestions.
                            </div>
                          )}
                      </div>
                    )}
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label
                    className="text-sm text-zinc-300"
                    htmlFor="c-postalCode"
                  >
                    Postal code<span className="ml-1 text-red-400">*</span>
                  </label>
                  <input
                    id="c-postalCode"
                    name="postalCode"
                    value={createPostalCode}
                    onChange={(event) =>
                      setCreatePostalCode(event.target.value)
                    }
                    disabled={!createCountryCode}
                    className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                    placeholder="e.g. 12045"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-zinc-300" htmlFor="c-city">
                    City<span className="ml-1 text-red-400">*</span>
                  </label>
                  <input
                    id="c-city"
                    name="city"
                    value={createCity}
                    onChange={(event) => {
                      setCreateCity(event.target.value);
                    }}
                    disabled={!createCountryCode}
                    className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                    placeholder="e.g. Berlin"
                    required
                  />
                </div>
              </div>

              {createBuildingError && (
                <div className="rounded-lg border border-red-900/40 bg-red-950/30 px-3 py-2 text-sm text-red-200">
                  {createBuildingError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="h-10 rounded-lg border border-zinc-800 bg-transparent px-4 text-sm text-zinc-200 hover:bg-zinc-900"
                  onClick={() => setIsCreateBuildingOpen(false)}
                  disabled={isBuildingCreating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 rounded-lg bg-zinc-100 px-4 text-sm font-medium text-zinc-950 hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
                  disabled={isBuildingCreating}
                >
                  {isBuildingCreating ? 'Creating…' : 'Create building'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
