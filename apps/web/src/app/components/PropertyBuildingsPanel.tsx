'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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

  const [editBuilding, setEditBuilding] = useState<Building | null>(null);
  const [isBuildingSaving, setIsBuildingSaving] = useState(false);
  const [buildingError, setBuildingError] = useState<string | null>(null);

  useEffect(() => {
    onCountChange?.(buildings.length);
  }, [buildings.length, onCountChange]);

  async function onCreateBuilding(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreateBuildingError(null);
    setIsBuildingCreating(true);

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

      const res = await fetch(`${apiBaseUrl}/properties/${propertyId}/buildings`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, street, houseNumber, postalCode, city, country }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Failed to create building (${res.status})`);
      }

      const created = (await res.json()) as Building;
      setBuildings((prev) => [created, ...prev]);
      setIsCreateBuildingOpen(false);
      router.push(`/properties/${propertyId}/buildings/${created.id}`);
    } catch (err) {
      setCreateBuildingError(
        err instanceof Error ? err.message : 'Something went wrong.',
      );
    } finally {
      setIsBuildingCreating(false);
    }
  }

  async function onSaveBuilding(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editBuilding) return;

    setBuildingError(null);
    setIsBuildingSaving(true);

    try {
      const formData = new FormData(e.currentTarget);

      const patch: Partial<
        Pick<
          Building,
          'name' | 'street' | 'houseNumber' | 'postalCode' | 'city' | 'country'
        >
      > = {
        name: String(formData.get('name') ?? '').trim(),
        street: String(formData.get('street') ?? '').trim(),
        houseNumber: String(formData.get('houseNumber') ?? '').trim(),
        postalCode: String(formData.get('postalCode') ?? '').trim(),
        city: String(formData.get('city') ?? '').trim(),
        country: String(formData.get('country') ?? '').trim(),
      };

      const res = await fetch(
        `${apiBaseUrl}/properties/${propertyId}/buildings/${editBuilding.id}`,
        {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(patch),
        },
      );

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Failed to save building (${res.status})`);
      }

      const updated = (await res.json()) as Building;
      setBuildings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      setEditBuilding(null);
    } catch (err) {
      setBuildingError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsBuildingSaving(false);
    }
  }

  return (
    <>
      <section className="overflow-hidden rounded-xl border border-zinc-800">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-800 bg-zinc-900 px-5 py-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-medium text-zinc-200">Buildings</h2>
            <p className="text-xs text-zinc-400">Buildings linked to this property.</p>
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100 hover:bg-zinc-800"
            aria-label="Add building"
            onClick={() => {
              setCreateBuildingError(null);
              setIsCreateBuildingOpen(true);
            }}
          >
            +
          </button>
        </div>

        <div className="divide-y divide-zinc-900">
          {buildings.map((b) => (
            <div
              key={b.id}
              className="flex flex-col gap-2 px-5 py-4 hover:bg-zinc-900/40 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-zinc-100">
                  <Link
                    href={`/properties/${propertyId}/buildings/${b.id}`}
                    className="hover:underline"
                  >
                    {b.name}
                  </Link>
                </div>
                <div className="mt-1 truncate text-xs text-zinc-400">
                  {b.street} {b.houseNumber}, {b.postalCode} {b.city}, {b.country}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="h-9 rounded-lg border border-zinc-800 bg-transparent px-3 text-sm text-zinc-200 hover:bg-zinc-900"
                  onClick={() => {
                    setBuildingError(null);
                    setEditBuilding(b);
                  }}
                >
                  Edit
                </button>
              </div>
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
                <p className="text-xs text-zinc-400">Add a building to this property.</p>
              </div>

              <button
                type="button"
                className="rounded-md px-2 py-1 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100"
                onClick={() => setIsCreateBuildingOpen(false)}
              >
                Close
              </button>
            </div>

            <form onSubmit={onCreateBuilding} className="flex flex-col gap-4 px-5 py-4">
              <div className="grid gap-2">
                <label className="text-sm text-zinc-300" htmlFor="c-name">
                  Building name
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
                <div className="grid gap-2">
                  <label className="text-sm text-zinc-300" htmlFor="c-street">
                    Street
                  </label>
                  <input
                    id="c-street"
                    name="street"
                    className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                    placeholder="e.g. Sonnenallee"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm text-zinc-300" htmlFor="c-houseNumber">
                    House number
                  </label>
                  <input
                    id="c-houseNumber"
                    name="houseNumber"
                    className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                    placeholder="e.g. 12"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm text-zinc-300" htmlFor="c-postalCode">
                    Postal code
                  </label>
                  <input
                    id="c-postalCode"
                    name="postalCode"
                    className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                    placeholder="e.g. 12045"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm text-zinc-300" htmlFor="c-city">
                    City
                  </label>
                  <input
                    id="c-city"
                    name="city"
                    className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                    placeholder="e.g. Berlin"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm text-zinc-300" htmlFor="c-country">
                  Country
                </label>
                <input
                  id="c-country"
                  name="country"
                  className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                  placeholder="e.g. DE"
                  required
                />
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
                  className="h-10 rounded-lg bg-zinc-100 px-4 text-sm font-medium text-zinc-950 hover:bg-white disabled:opacity-60"
                  disabled={isBuildingCreating}
                >
                  {isBuildingCreating ? 'Creating…' : 'Create building'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editBuilding && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
          <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-900 px-5 py-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-base font-semibold">Edit building</h2>
                <p className="text-xs text-zinc-400">Update building details.</p>
              </div>

              <button
                type="button"
                className="rounded-md px-2 py-1 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100"
                onClick={() => setEditBuilding(null)}
              >
                Close
              </button>
            </div>

            <form onSubmit={onSaveBuilding} className="flex flex-col gap-4 px-5 py-4">
              <div className="grid gap-2">
                <label className="text-sm text-zinc-300" htmlFor="b-name">
                  Building name
                </label>
                <input
                  id="b-name"
                  name="name"
                  defaultValue={editBuilding.name}
                  className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                  required
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm text-zinc-300" htmlFor="b-street">
                    Street
                  </label>
                  <input
                    id="b-street"
                    name="street"
                    defaultValue={editBuilding.street}
                    className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm text-zinc-300" htmlFor="b-houseNumber">
                    House number
                  </label>
                  <input
                    id="b-houseNumber"
                    name="houseNumber"
                    defaultValue={editBuilding.houseNumber}
                    className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm text-zinc-300" htmlFor="b-postalCode">
                    Postal code
                  </label>
                  <input
                    id="b-postalCode"
                    name="postalCode"
                    defaultValue={editBuilding.postalCode}
                    className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm text-zinc-300" htmlFor="b-city">
                    City
                  </label>
                  <input
                    id="b-city"
                    name="city"
                    defaultValue={editBuilding.city}
                    className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm text-zinc-300" htmlFor="b-country">
                  Country
                </label>
                <input
                  id="b-country"
                  name="country"
                  defaultValue={editBuilding.country}
                  className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                  required
                />
              </div>

              {buildingError && (
                <div className="rounded-lg border border-red-900/40 bg-red-950/30 px-3 py-2 text-sm text-red-200">
                  {buildingError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="h-10 rounded-lg border border-zinc-800 bg-transparent px-4 text-sm text-zinc-200 hover:bg-zinc-900"
                  onClick={() => setEditBuilding(null)}
                  disabled={isBuildingSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 rounded-lg bg-zinc-100 px-4 text-sm font-medium text-zinc-950 hover:bg-white disabled:opacity-60"
                  disabled={isBuildingSaving}
                >
                  {isBuildingSaving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

