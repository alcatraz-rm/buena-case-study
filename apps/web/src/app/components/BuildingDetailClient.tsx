'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { COUNTRY_OPTIONS } from '../lib/zippopotam/countries';
import { lookupPostalCode } from '../lib/zippopotam/zippopotam';
import { Breadcrumbs } from './Breadcrumbs';
import { BuildingUnitsPanel } from './BuildingUnitsPanel';

type Building = {
  id: number;
  propertyId: number;
  name: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  country: string;
  createdAt: string;
  updatedAt: string;
};

type Property = {
  id: number;
  name: string;
};

type BuildingUnitType = 'Apartment' | 'Office' | 'Garden' | 'Parking';

type Unit = {
  id: number;
  buildingId: number;
  unitType: BuildingUnitType;
  number: string;
  floor: string | null;
  entrance: string | null;
  sizeSqm: number | null;
  coOwnershipShare: string | null;
  constructionYear: number | null;
  rooms: number | null;
  createdAt: string;
  updatedAt: string;
};

type Tab = 'details' | 'units';

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
  const [tab, setTab] = useState<Tab>('details');

  const [building, setBuilding] = useState<Building>(initialBuilding);
  const [unitCount, setUnitCount] = useState<number>(units.length);
  const [isDirty, setIsDirty] = useState(false);

  const [countryCode, setCountryCode] = useState<string>(initialBuilding.country);
  const [postalCode, setPostalCode] = useState<string>(initialBuilding.postalCode);
  const [city, setCity] = useState<string>(initialBuilding.city);
  const [cityTouched, setCityTouched] = useState(false);
  const [postalLookupHint, setPostalLookupHint] = useState<string | null>(null);
  const isKnownCountryCode = COUNTRY_OPTIONS.some((c) => c.code === countryCode);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState<string | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
    if (!countryCode || !postalCode.trim()) {
      setPostalLookupHint(null);
      return;
    }

    const controller = new AbortController();
    const t = window.setTimeout(async () => {
      try {
        const res = await lookupPostalCode({
          countryCode,
          postalCode,
          signal: controller.signal,
        });

        if (!res) {
          setPostalLookupHint('No match found.');
          return;
        }

        setPostalLookupHint(
          res.placeCount > 1 ? `Found ${res.placeCount} places.` : 'Match found.',
        );
        if (!cityTouched) setCity(res.city);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setPostalLookupHint('Lookup failed.');
      }
    }, 450);

    return () => {
      controller.abort();
      window.clearTimeout(t);
    };
  }, [countryCode, postalCode, cityTouched]);

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
      const formData = new FormData(e.currentTarget);
      const name = String(formData.get('name') ?? '').trim();
      const street = String(formData.get('street') ?? '').trim();
      const houseNumber = String(formData.get('houseNumber') ?? '').trim();
      const postalCode = String(formData.get('postalCode') ?? '').trim();
      const city = String(formData.get('city') ?? '').trim();
      const country = String(formData.get('country') ?? '').trim();

      if (!name) throw new Error('Building name is required.');
      if (!street) throw new Error('Street is required.');
      if (!houseNumber) throw new Error('House number is required.');
      if (!postalCode) throw new Error('Postal code is required.');
      if (!city) throw new Error('City is required.');
      if (!country) throw new Error('Country is required.');

      const res = await fetch(
        `${apiBaseUrl}/properties/${property.id}/buildings/${building.id}`,
        {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ name, street, houseNumber, postalCode, city, country }),
        },
      );

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Failed to save (${res.status})`);
      }

      const updated = (await res.json()) as Building;
      setBuilding(updated);
      setCountryCode(updated.country);
      setPostalCode(updated.postalCode);
      setCity(updated.city);
      setCityTouched(false);
      setSaveOk('Saved.');
      setIsDirty(false);
      router.refresh();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Something went wrong.');
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
      setDeleteError(err instanceof Error ? err.message : 'Something went wrong.');
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
              className="h-10 rounded-lg border border-red-900/50 bg-transparent px-4 text-sm text-red-200 hover:bg-red-950/40 disabled:opacity-60"
              onClick={onDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </header>

        {deleteError && (
          <div className="rounded-lg border border-red-900/40 bg-red-950/30 px-4 py-3 text-sm text-red-200">
            {deleteError}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            className={[
              'h-9 rounded-lg border px-3 text-sm',
              tab === 'details'
                ? 'border-zinc-700 bg-zinc-900 text-zinc-100'
                : 'border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-900/50',
            ].join(' ')}
            onClick={() => setTab('details')}
          >
            Details
          </button>
          <button
            type="button"
            className={[
              'h-9 rounded-lg border px-3 text-sm',
              tab === 'units'
                ? 'border-zinc-700 bg-zinc-900 text-zinc-100'
                : 'border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-900/50',
            ].join(' ')}
            onClick={() => setTab('units')}
          >
            Units ({unitCount})
          </button>
        </div>

        {tab === 'details' && (
          <section className="overflow-hidden rounded-xl border border-zinc-800">
            <div className="border-b border-zinc-800 bg-zinc-900 px-5 py-4">
              <h2 className="text-sm font-medium text-zinc-200">Basic info</h2>
              <p className="mt-1 text-xs text-zinc-400">Edit building details.</p>
            </div>

            <form onSubmit={onSave} className="flex flex-col gap-4 px-5 py-4">
              <div className="grid gap-2">
                <label className="text-sm text-zinc-300" htmlFor="country">
                  Country
                </label>
                <select
                  id="country"
                  name="country"
                  value={countryCode}
                  onChange={(e) => {
                    setCountryCode(e.target.value);
                    setIsDirty(true);
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
                  Building name
                </label>
                <input
                  id="name"
                  name="name"
                  defaultValue={building.name}
                  onChange={() => setIsDirty(true)}
                  className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                  required
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm text-zinc-300" htmlFor="street">
                    Street
                  </label>
                  <input
                    id="street"
                    name="street"
                    defaultValue={building.street}
                    onChange={() => setIsDirty(true)}
                    className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                    disabled={!countryCode}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm text-zinc-300" htmlFor="houseNumber">
                    House number
                  </label>
                  <input
                    id="houseNumber"
                    name="houseNumber"
                    defaultValue={building.houseNumber}
                    onChange={() => setIsDirty(true)}
                    className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                    disabled={!countryCode}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-zinc-300" htmlFor="postalCode">
                    Postal code
                  </label>
                  <input
                    id="postalCode"
                    name="postalCode"
                    value={postalCode}
                    onChange={(e) => {
                      setPostalCode(e.target.value);
                      setIsDirty(true);
                    }}
                    className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                    disabled={!countryCode}
                    required
                  />
                  {postalLookupHint && (
                    <div className="text-xs text-zinc-500">{postalLookupHint}</div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm text-zinc-300" htmlFor="city">
                    City
                  </label>
                  <input
                    id="city"
                    name="city"
                    value={city}
                    onChange={(e) => {
                      setCityTouched(true);
                      setCity(e.target.value);
                      setIsDirty(true);
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
                  className="h-10 rounded-lg bg-zinc-100 px-4 text-sm font-medium text-zinc-950 hover:bg-white disabled:opacity-60"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>
          </section>
        )}

        {tab === 'units' && (
          <BuildingUnitsPanel
            apiBaseUrl={apiBaseUrl}
            buildingId={building.id}
            initialUnits={units}
            onCountChange={setUnitCount}
          />
        )}
      </div>
    </div>
  );
}

