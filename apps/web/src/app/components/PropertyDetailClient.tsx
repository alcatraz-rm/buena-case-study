'use client';

import type {
  Building,
  ManagementType,
  PersonOption,
  Property,
  UpdatePropertyDto,
} from '@buena/shared';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Breadcrumbs } from './Breadcrumbs';
import { PropertyBuildingsPanel } from './PropertyBuildingsPanel';

type Props = {
  apiBaseUrl: string;
  property: Property;
  buildings: Building[];
  managers: PersonOption[];
  accountants: PersonOption[];
  initialTab?: Tab;
};

type Tab = 'details' | 'buildings';

export function PropertyDetailClient({
  apiBaseUrl,
  property: initialProperty,
  buildings: initialBuildings,
  managers,
  accountants,
  initialTab,
}: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(initialTab ?? 'details');

  const [property, setProperty] = useState<Property>(initialProperty);
  const [buildingCount, setBuildingCount] = useState<number>(
    initialBuildings.length,
  );
  const [isDirty, setIsDirty] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState<string | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const managerLabelById = useMemo(() => {
    return new Map(managers.map((m) => [m.id, m.name]));
  }, [managers]);

  const accountantLabelById = useMemo(() => {
    return new Map(accountants.map((a) => [a.id, a.name]));
  }, [accountants]);

  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = '';
    }

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

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
        body: JSON.stringify({
          name,
          managementType,
          managerId,
          accountantId,
        } satisfies UpdatePropertyDto),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Failed to save (${res.status})`);
      }

      const updated = (await res.json()) as Property;
      setProperty(updated);
      setSaveOk('Saved.');
      setIsDirty(false);
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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <Breadcrumbs
              confirmNavigate={confirmNavigate}
              items={[
                { label: 'Properties', href: '/' },
                {
                  label: property.name,
                  href: `/properties/${property.id}`,
                  isCurrent: true,
                },
              ]}
            />
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
              tab === 'buildings'
                ? 'border-zinc-700 bg-zinc-900 text-zinc-100'
                : 'border-zinc-800 bg-transparent text-zinc-300 hover:bg-zinc-900/50',
            ].join(' ')}
            onClick={() => setTab('buildings')}
          >
            Buildings ({buildingCount})
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
                  onChange={() => setIsDirty(true)}
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
                    onChange={() => setIsDirty(true)}
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
                    onChange={() => setIsDirty(true)}
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
                    onChange={() => setIsDirty(true)}
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
          <PropertyBuildingsPanel
            apiBaseUrl={apiBaseUrl}
            propertyId={property.id}
            initialBuildings={initialBuildings}
            onCountChange={setBuildingCount}
          />
        )}
      </div>
    </div>
  );
}
