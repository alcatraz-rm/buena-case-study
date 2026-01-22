'use client';

import type { AddressSuggestion, Building, Property, Unit } from '@buena/types';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { COUNTRY_OPTIONS } from '../lib/countries';
import { suggestAddresses } from '../lib/geocode';
import { Breadcrumbs } from './Breadcrumbs';
import { BuildingUnitsPanel } from './BuildingUnitsPanel';

type Props = {
  apiBaseUrl: string;
  property: Property;
  building: Building;
  units: Unit[];
};

export function BuildingDetailClient({
  apiBaseUrl,
  property,
  building: initialBuilding,
  units,
}: Props) {
  const router = useRouter();
  const [isFormCollapsed, setIsFormCollapsed] = useState(true);

  const [building, setBuilding] = useState<Building>(initialBuilding);
  const [unitsState, setUnitsState] = useState<Unit[]>(units);
  const [buildingName, setBuildingName] = useState(initialBuilding.name);

  const [countryCode, setCountryCode] = useState<string>(
    initialBuilding.country,
  );
  const [street, setStreet] = useState<string>(initialBuilding.street);
  const [houseNumber, setHouseNumber] = useState<string>(
    initialBuilding.houseNumber,
  );
  const [postalCode, setPostalCode] = useState<string>(
    initialBuilding.postalCode,
  );
  const [city, setCity] = useState<string>(initialBuilding.city);
  const [streetSuggestions, setStreetSuggestions] = useState<
    AddressSuggestion[]
  >([]);
  const [isStreetSuggesting, setIsStreetSuggesting] = useState(false);
  const [suggestAnchor, setSuggestAnchor] = useState<'street' | 'houseNumber'>(
    'street',
  );
  const [suppressSuggestions, setSuppressSuggestions] = useState(false);
  const [streetFocused, setStreetFocused] = useState(false);
  const [houseNumberFocused, setHouseNumberFocused] = useState(false);
  const isKnownCountryCode = COUNTRY_OPTIONS.some(
    (c) => c.code === countryCode,
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState<string | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isDirty =
    buildingName !== building.name ||
    countryCode !== building.country ||
    street !== building.street ||
    houseNumber !== building.houseNumber ||
    postalCode !== building.postalCode ||
    city !== building.city;

  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = '';
    }

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (suppressSuggestions) return;
    if (!countryCode || street.trim().length < 3) {
      setStreetSuggestions([]);
      setIsStreetSuggesting(false);
      return;
    }

    const controller = new AbortController();
    setIsStreetSuggesting(true);

    const t = window.setTimeout(async () => {
      const query = `${street}${houseNumber.trim() ? ` ${houseNumber.trim()}` : ''}`;
      const suggestions = await suggestAddresses({
        apiBaseUrl,
        countryCode,
        query,
        signal: controller.signal,
      });
      setStreetSuggestions(suggestions);
      setIsStreetSuggesting(false);
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(t);
      setIsStreetSuggesting(false);
    };
  }, [apiBaseUrl, countryCode, street, houseNumber, suppressSuggestions]);

  useEffect(() => {
    // Postal code lookup removed (Zippopotam removed).
  }, []);

  function confirmNavigate(): boolean {
    if (!isDirty) return true;
    return window.confirm('You have unsaved changes. Leave this page?');
  }

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaveError(null);
    setSaveOk(null);
    setIsSaving(true);

    try {
      const name = buildingName.trim();
      const streetTrimmed = street.trim();
      const houseNumberTrimmed = houseNumber.trim();
      const postalCodeTrimmed = postalCode.trim();
      const cityTrimmed = city.trim();
      const countryTrimmed = countryCode.trim();

      if (!name) throw new Error('Building name is required.');
      if (!streetTrimmed) throw new Error('Street is required.');
      if (!houseNumberTrimmed) throw new Error('House number is required.');
      if (!postalCodeTrimmed) throw new Error('Postal code is required.');
      if (!cityTrimmed) throw new Error('City is required.');
      if (!countryTrimmed) throw new Error('Country is required.');

      const res = await fetch(
        `${apiBaseUrl}/properties/${property.id}/buildings/${building.id}`,
        {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            name,
            street: streetTrimmed,
            houseNumber: houseNumberTrimmed,
            postalCode: postalCodeTrimmed,
            city: cityTrimmed,
            country: countryTrimmed,
          }),
        },
      );

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Failed to save (${res.status})`);
      }

      const updated = (await res.json()) as Building;
      setBuilding(updated);
      setBuildingName(updated.name);
      setCountryCode(updated.country);
      setStreet(updated.street);
      setHouseNumber(updated.houseNumber);
      setPostalCode(updated.postalCode);
      setCity(updated.city);
      setSaveOk('Saved.');
      router.refresh();
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : 'Something went wrong.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function onDelete() {
    setDeleteError(null);
    setIsDeleting(true);

    try {
      const ok = window.confirm('Delete this building?');
      if (!ok) return;

      const res = await fetch(
        `${apiBaseUrl}/properties/${property.id}/buildings/${building.id}`,
        { method: 'DELETE' },
      );

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Failed to delete (${res.status})`);
      }

      router.push(`/properties/${property.id}?tab=buildings`);
      router.refresh();
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : 'Something went wrong.',
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <Breadcrumbs
              confirmNavigate={confirmNavigate}
              items={[
                { label: 'Properties', href: '/' },
                { label: property.name, href: `/properties/${property.id}` },
                {
                  label: building.name,
                  href: `/properties/${property.id}/buildings/${building.id}`,
                  isCurrent: true,
                },
              ]}
            />
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold tracking-tight">
                {building.name}
              </h1>
              <p className="text-sm text-zinc-400">
                {building.street} {building.houseNumber}, {building.postalCode}{' '}
                {building.city}, {building.country}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isDirty && (
              <div className="rounded-full border border-amber-900/40 bg-amber-950/20 px-3 py-2 text-xs text-amber-200">
                Unsaved changes
              </div>
            )}
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-900/50 bg-transparent text-red-200 hover:bg-red-950/40 disabled:opacity-60"
              onClick={onDelete}
              disabled={isDeleting}
              aria-label={isDeleting ? 'Deleting building…' : 'Delete building'}
            >
              {isDeleting ? (
                <span className="text-xs">…</span>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="M6 6l1 16h10l1-16" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                </svg>
              )}
            </button>
          </div>
        </header>

        {deleteError && (
          <div className="rounded-lg border border-red-900/40 bg-red-950/30 px-4 py-3 text-sm text-red-200">
            {deleteError}
          </div>
        )}

        <section className="overflow-hidden rounded-xl border border-zinc-800">
          <div className="flex items-start justify-between gap-4 border-b border-zinc-800 bg-zinc-900 px-5 py-4">
            <div className="flex min-w-0 flex-col gap-1">
              <h2 className="text-sm font-medium text-zinc-200">Basic info</h2>
              <p className="text-xs text-zinc-400">
                {building.street} {building.houseNumber}, {building.postalCode}{' '}
                {building.city}, {building.country}
              </p>
            </div>

            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100 hover:bg-zinc-800"
              aria-label={
                isFormCollapsed ? 'Expand basic info' : 'Collapse basic info'
              }
              aria-expanded={!isFormCollapsed}
              onClick={() => setIsFormCollapsed((v) => !v)}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={[
                  'h-4 w-4 transition-transform duration-200',
                  isFormCollapsed ? 'rotate-0' : 'rotate-180',
                ].join(' ')}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </div>

          <div
            className={[
              'overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out',
              isFormCollapsed
                ? 'max-h-0 opacity-0'
                : 'max-h-[1600px] opacity-100',
            ].join(' ')}
            aria-hidden={isFormCollapsed}
          >
            <form
              onSubmit={onSave}
              className={[
                'flex flex-col gap-4 px-5 py-4',
                isFormCollapsed ? 'pointer-events-none' : '',
              ].join(' ')}
            >
              <div className="grid gap-2">
                <label className="text-sm text-zinc-300" htmlFor="country">
                  Country<span className="ml-1 text-red-400">*</span>
                </label>
                <select
                  id="country"
                  name="country"
                  value={countryCode}
                  onChange={(e) => {
                    setCountryCode(e.target.value);
                  }}
                  className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 pl-3 pr-10 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                  required
                >
                  <option value="" disabled>
                    Select country…
                  </option>
                  {!isKnownCountryCode && countryCode && (
                    <option value={countryCode}>{countryCode} (custom)</option>
                  )}
                  {COUNTRY_OPTIONS.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <label className="text-sm text-zinc-300" htmlFor="name">
                  Building name<span className="ml-1 text-red-400">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  value={buildingName}
                  onChange={(e) => setBuildingName(e.target.value)}
                  className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                  required
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="relative flex flex-col gap-2">
                  <label className="text-sm text-zinc-300" htmlFor="street">
                    Street<span className="ml-1 text-red-400">*</span>
                  </label>
                  <input
                    id="street"
                    name="street"
                    value={street}
                    onChange={(e) => {
                      setSuggestAnchor('street');
                      setSuppressSuggestions(false);
                      setStreet(e.target.value);
                    }}
                    onFocus={() => {
                      setSuggestAnchor('street');
                      setStreetFocused(true);
                    }}
                    onBlur={() => setStreetFocused(false)}
                    className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                    disabled={!countryCode}
                    required
                  />
                  {suggestAnchor === 'street' &&
                    streetFocused &&
                    (isStreetSuggesting || streetSuggestions.length > 0) && (
                      <div className="absolute left-0 right-0 top-[4.75rem] z-10 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 shadow-xl">
                        {isStreetSuggesting && (
                          <div className="px-3 py-2 text-xs text-zinc-500">
                            Searching…
                          </div>
                        )}
                        {streetSuggestions.map((s) => (
                          <button
                            key={`${s.lat}-${s.lon}`}
                            type="button"
                            className="w-full px-3 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-900"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setStreet(s.street);
                              setHouseNumber(s.houseNumber);
                              setPostalCode(s.postalCode);
                              setCity(s.city);
                              setStreetSuggestions([]);
                              setSuppressSuggestions(true);
                            }}
                          >
                            <div className="truncate">{s.label}</div>
                          </button>
                        ))}
                        {!isStreetSuggesting &&
                          streetSuggestions.length === 0 && (
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
                    htmlFor="houseNumber"
                  >
                    House number<span className="ml-1 text-red-400">*</span>
                  </label>
                  <input
                    id="houseNumber"
                    name="houseNumber"
                    value={houseNumber}
                    onChange={(e) => {
                      setSuggestAnchor('houseNumber');
                      setSuppressSuggestions(false);
                      setHouseNumber(e.target.value);
                    }}
                    onFocus={() => {
                      setSuggestAnchor('houseNumber');
                      setHouseNumberFocused(true);
                    }}
                    onBlur={() => setHouseNumberFocused(false)}
                    className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                    disabled={!countryCode}
                    required
                  />
                  {suggestAnchor === 'houseNumber' &&
                    houseNumberFocused &&
                    (isStreetSuggesting || streetSuggestions.length > 0) && (
                      <div className="absolute left-0 right-0 top-[4.75rem] z-10 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 shadow-xl">
                        {isStreetSuggesting && (
                          <div className="px-3 py-2 text-xs text-zinc-500">
                            Searching…
                          </div>
                        )}
                        {streetSuggestions.map((s) => (
                          <button
                            key={`${s.lat}-${s.lon}`}
                            type="button"
                            className="w-full px-3 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-900"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setStreet(s.street);
                              setHouseNumber(s.houseNumber);
                              setPostalCode(s.postalCode);
                              setCity(s.city);
                              setStreetSuggestions([]);
                              setSuppressSuggestions(true);
                            }}
                          >
                            <div className="truncate">{s.label}</div>
                          </button>
                        ))}
                        {!isStreetSuggesting &&
                          streetSuggestions.length === 0 && (
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
                  <label className="text-sm text-zinc-300" htmlFor="postalCode">
                    Postal code<span className="ml-1 text-red-400">*</span>
                  </label>
                  <input
                    id="postalCode"
                    name="postalCode"
                    value={postalCode}
                    onChange={(e) => {
                      setPostalCode(e.target.value);
                    }}
                    className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                    disabled={!countryCode}
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm text-zinc-300" htmlFor="city">
                    City<span className="ml-1 text-red-400">*</span>
                  </label>
                  <input
                    id="city"
                    name="city"
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                    }}
                    className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                    disabled={!countryCode}
                    required
                  />
                </div>
              </div>

              {(saveError || saveOk) && (
                <div
                  className={[
                    'rounded-lg border px-3 py-2 text-sm',
                    saveError
                      ? 'border-red-900/40 bg-red-950/30 text-red-200'
                      : 'border-emerald-900/40 bg-emerald-950/20 text-emerald-200',
                  ].join(' ')}
                >
                  {saveError ?? saveOk}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  className="h-10 rounded-lg bg-zinc-100 px-4 text-sm font-medium text-zinc-950 hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
                  disabled={isSaving || !isDirty}
                >
                  {isSaving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </section>

        <BuildingUnitsPanel
          apiBaseUrl={apiBaseUrl}
          buildingId={building.id}
          initialUnits={unitsState}
          onUnitsChange={setUnitsState}
        />
      </div>
    </div>
  );
}
