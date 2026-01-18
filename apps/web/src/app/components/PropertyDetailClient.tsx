'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

type ManagementType = 'WEG' | 'MV';

type PersonOption = {
  id: number;
  name: string;
  email: string;
};

type Property = {
  id: number;
  name: string;
  managementType: ManagementType;
  managerId: number;
  accountantId: number;
  createdAt: string;
  updatedAt: string;
};

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
  property: Property;
  buildings: Building[];
  managers: PersonOption[];
  accountants: PersonOption[];
};

type Tab = 'details' | 'buildings';

export function PropertyDetailClient({
  apiBaseUrl,
  property: initialProperty,
  buildings: initialBuildings,
  managers,
  accountants,
}: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('details');

  const [property, setProperty] = useState<Property>(initialProperty);
  const [buildings, setBuildings] = useState<Building[]>(initialBuildings);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState<string | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [editBuilding, setEditBuilding] = useState<Building | null>(null);
  const [isBuildingSaving, setIsBuildingSaving] = useState(false);
  const [buildingError, setBuildingError] = useState<string | null>(null);

  const managerLabelById = useMemo(() => {
    return new Map(managers.map((m) => [m.id, m.name]));
  }, [managers]);

  const accountantLabelById = useMemo(() => {
    return new Map(accountants.map((a) => [a.id, a.name]));
  }, [accountants]);

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaveError(null);
    setSaveOk(null);
    setIsSaving(true);

    try {
      const formData = new FormData(e.currentTarget);
      const name = String(formData.get('name') ?? '').trim();
      const managementType = String(
        formData.get('managementType') ?? 'WEG',
      ) as ManagementType;
      const managerId = Number(formData.get('managerId'));
      const accountantId = Number(formData.get('accountantId'));

      if (!name) throw new Error('Name is required.');
      if (!Number.isFinite(managerId)) throw new Error('Manager is required.');
      if (!Number.isFinite(accountantId))
        throw new Error('Accountant is required.');

      const res = await fetch(`${apiBaseUrl}/properties/${property.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, managementType, managerId, accountantId }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Failed to save (${res.status})`);
      }

      const updated = (await res.json()) as Property;
      setProperty(updated);
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
      const ok = window.confirm('Delete this property?');
      if (!ok) return;

      const res = await fetch(`${apiBaseUrl}/properties/${property.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Failed to delete (${res.status})`);
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : 'Something went wrong.',
      );
    } finally {
      setIsDeleting(false);
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
        `${apiBaseUrl}/properties/${property.id}/buildings/${editBuilding.id}`,
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
      setBuildings((prev) =>
        prev.map((b) => (b.id === updated.id ? updated : b)),
      );
      setEditBuilding(null);
      router.refresh();
    } catch (err) {
      setBuildingError(
        err instanceof Error ? err.message : 'Something went wrong.',
      );
    } finally {
      setIsBuildingSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <Link
              href="/"
              className="w-fit text-sm text-zinc-400 hover:text-zinc-200"
            >
              ← Back to properties
            </Link>
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold tracking-tight">
                {property.name}
              </h1>
              <p className="text-sm text-zinc-400">
                {property.managementType} ·{' '}
                {managerLabelById.get(property.managerId) ??
                  `#${property.managerId}`}{' '}
                ·{' '}
                {accountantLabelById.get(property.accountantId) ??
                  `#${property.accountantId}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
              tab === 'buildings'
                ? 'border-zinc-700 bg-zinc-900 text-zinc-100'
                : 'border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-900/50',
            ].join(' ')}
            onClick={() => setTab('buildings')}
          >
            Buildings ({buildings.length})
          </button>
        </div>

        {tab === 'details' && (
          <section className="overflow-hidden rounded-xl border border-zinc-800">
            <div className="border-b border-zinc-800 bg-zinc-900 px-5 py-4">
              <h2 className="text-sm font-medium text-zinc-200">Basic info</h2>
              <p className="mt-1 text-xs text-zinc-400">
                Edit property name, management type, and assignments.
              </p>
            </div>

            <form onSubmit={onSave} className="flex flex-col gap-4 px-5 py-4">
              <div className="grid gap-2">
                <label className="text-sm text-zinc-300" htmlFor="name">
                  Property name
                </label>
                <input
                  id="name"
                  name="name"
                  defaultValue={property.name}
                  className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-zinc-700"
                  required
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid min-w-0 gap-2">
                  <label
                    className="text-sm text-zinc-300"
                    htmlFor="managementType"
                  >
                    Management type
                  </label>
                  <select
                    id="managementType"
                    name="managementType"
                    className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 pl-3 pr-10 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                    defaultValue={property.managementType}
                  >
                    <option value="WEG">WEG</option>
                    <option value="MV">MV</option>
                  </select>
                </div>

                <div className="grid min-w-0 gap-2">
                  <label className="text-sm text-zinc-300">Teilerklärung</label>
                  <div className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-400 flex items-center">
                    Not implemented yet
                  </div>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid min-w-0 gap-2">
                  <label className="text-sm text-zinc-300" htmlFor="managerId">
                    Manager
                  </label>
                  <select
                    id="managerId"
                    name="managerId"
                    className="h-10 w-full truncate rounded-lg border border-zinc-800 bg-zinc-900 pl-3 pr-10 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                    defaultValue={String(property.managerId)}
                  >
                    {managers.map((m) => (
                      <option key={m.id} value={String(m.id)}>
                        {m.name} ({m.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid min-w-0 gap-2">
                  <label
                    className="text-sm text-zinc-300"
                    htmlFor="accountantId"
                  >
                    Accountant
                  </label>
                  <select
                    id="accountantId"
                    name="accountantId"
                    className="h-10 w-full truncate rounded-lg border border-zinc-800 bg-zinc-900 pl-3 pr-10 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                    defaultValue={String(property.accountantId)}
                  >
                    {accountants.map((a) => (
                      <option key={a.id} value={String(a.id)}>
                        {a.name} ({a.email})
                      </option>
                    ))}
                  </select>
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

        {tab === 'buildings' && (
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
                onClick={() =>
                  window.alert('Create building is not implemented yet.')
                }
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
                      {b.name}
                    </div>
                    <div className="mt-1 truncate text-xs text-zinc-400">
                      {b.street} {b.houseNumber}, {b.postalCode} {b.city},{' '}
                      {b.country}
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
        )}
      </div>

      {editBuilding && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
          <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-900 px-5 py-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-base font-semibold">Edit building</h2>
                <p className="text-xs text-zinc-400">
                  Update building details.
                </p>
              </div>

              <button
                type="button"
                className="rounded-md px-2 py-1 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100"
                onClick={() => setEditBuilding(null)}
              >
                Close
              </button>
            </div>

            <form
              onSubmit={onSaveBuilding}
              className="flex flex-col gap-4 px-5 py-4"
            >
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
                  <label
                    className="text-sm text-zinc-300"
                    htmlFor="b-houseNumber"
                  >
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
                  <label
                    className="text-sm text-zinc-300"
                    htmlFor="b-postalCode"
                  >
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
    </div>
  );
}
