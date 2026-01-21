'use client';

import type {
  CreatePropertyDto,
  ManagementType,
  PersonOption,
  Property,
  PropertyListItem,
} from '@buena/shared';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

type Props = {
  properties: PropertyListItem[];
  apiBaseUrl: string;
  managers: PersonOption[];
  accountants: PersonOption[];
};

type FeatureFlags = { openAiEnabled: boolean };

export function PropertiesPageClient({
  properties,
  apiBaseUrl,
  managers,
  accountants,
}: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [createStep, setCreateStep] = useState<'loading' | 'choose' | 'manual'>(
    'manual',
  );
  const [openAiEnabled, setOpenAiEnabled] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdPropertyId, setCreatedPropertyId] = useState<number | null>(
    null,
  );

  const managerLabelById = useMemo(() => {
    return new Map(managers.map((m) => [m.id, m.name]));
  }, [managers]);

  const accountantLabelById = useMemo(() => {
    return new Map(accountants.map((a) => [a.id, a.name]));
  }, [accountants]);

  const countLabel = useMemo(() => {
    return `${properties.length} ${properties.length === 1 ? 'property' : 'properties'}`;
  }, [properties.length]);

  async function openCreateProperty() {
    setError(null);
    setCreatedPropertyId(null);
    setIsOpen(true);

    if (openAiEnabled === null) {
      setCreateStep('loading');
      try {
        const res = await fetch(`${apiBaseUrl}/feature-flags`, {
          cache: 'no-store',
        });
        if (!res.ok) throw new Error('Failed to fetch feature flags');
        const flags = (await res.json()) as FeatureFlags;
        setOpenAiEnabled(flags.openAiEnabled);
        setCreateStep(flags.openAiEnabled ? 'choose' : 'manual');
      } catch {
        setOpenAiEnabled(false);
        setCreateStep('manual');
      }
      return;
    }

    setCreateStep(openAiEnabled ? 'choose' : 'manual');
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);

      const name = String(formData.get('name') ?? '').trim();
      const managementType = String(
        formData.get('managementType') ?? 'WEG',
      ) as ManagementType;
      const managerId = Number(formData.get('managerId'));
      const accountantId = Number(formData.get('accountantId'));
      const file = formData.get('file');
      const selectedFile = file instanceof File && file.size > 0 ? file : null;

      if (!name) throw new Error('Name is required.');
      if (!Number.isFinite(managerId)) throw new Error('Manager is required.');
      if (!Number.isFinite(accountantId))
        throw new Error('Accountant is required.');

      let propertyId = createdPropertyId;
      if (propertyId === null) {
        const res = await fetch(`${apiBaseUrl}/properties`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            name,
            managementType,
            managerId,
            accountantId,
          } satisfies CreatePropertyDto),
        });

        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(text || `Failed to create property (${res.status})`);
        }

        const created = (await res.json()) as Property;
        propertyId = created.id;
        setCreatedPropertyId(propertyId);
      }

      if (selectedFile) {
        const upload = new FormData();
        upload.append('file', selectedFile);

        const res = await fetch(
          `${apiBaseUrl}/properties/${propertyId}/declaration-of-division`,
          {
            method: 'POST',
            body: upload,
          },
        );

        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(
            text ||
              `Property created, but file upload failed (${res.status}). You can retry without creating a new property.`,
          );
        }
      }

      setIsOpen(false);
      setCreatedPropertyId(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
        <header className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Property dashboard
            </h1>
            <p className="text-sm text-zinc-400">{countLabel}</p>
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
            aria-label="Add property"
            onClick={openCreateProperty}
          >
            +
          </button>
        </header>

        <section className="overflow-hidden rounded-xl border border-zinc-800">
          <div className="grid grid-cols-12 items-center gap-3 border-b border-zinc-800 bg-zinc-900 px-4 py-3 text-xs font-medium uppercase tracking-wider text-zinc-400">
            <div className="col-span-1">ID</div>
            <div className="col-span-4">Name</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2">Manager</div>
            <div className="col-span-2">Accountant</div>
            <div className="col-span-1 text-right">Buildings</div>
          </div>

          <div className="divide-y divide-zinc-900">
            {properties.map((p) => (
              <div
                key={p.id}
                className="grid grid-cols-12 items-center gap-3 px-4 py-3 text-sm hover:bg-zinc-900/60"
              >
                <div className="col-span-1 tabular-nums leading-none text-zinc-400">
                  {p.id}
                </div>
                <Link
                  href={`/properties/${p.id}`}
                  className="col-span-4 min-w-0 rounded-lg p-1 -m-1 font-medium leading-none text-zinc-100 hover:bg-zinc-900/30 focus:outline-none focus:ring-2 focus:ring-zinc-700"
                >
                  <div className="truncate">{p.name}</div>
                </Link>
                <div className="col-span-2 leading-none text-zinc-300">
                  {p.managementType}
                </div>
                <div className="col-span-2 truncate leading-none text-zinc-300">
                  {managerLabelById.get(p.managerId) ?? `#${p.managerId}`}
                </div>
                <div className="col-span-2 truncate leading-none text-zinc-300">
                  {accountantLabelById.get(p.accountantId) ??
                    `#${p.accountantId}`}
                </div>
                <div className="col-span-1 text-right tabular-nums leading-none text-zinc-300">
                  {p.buildingCount}
                </div>
              </div>
            ))}

            {properties.length === 0 && (
              <div className="px-4 py-10 text-center text-sm text-zinc-400">
                No properties yet.
              </div>
            )}
          </div>
        </section>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
          <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-900 px-5 py-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-base font-semibold">New property</h2>
                <p className="text-xs text-zinc-400">
                  Create a property (WEG/MV) and assign manager/accountant.
                </p>
              </div>
            </div>

            {createStep === 'loading' && (
              <div className="px-5 py-10 text-sm text-zinc-300">Loading…</div>
            )}

            {createStep === 'choose' && (
              <div className="flex flex-col gap-4 px-5 py-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-left hover:bg-zinc-800"
                    onClick={() => setCreateStep('manual')}
                  >
                    <div className="text-sm font-medium text-zinc-100">
                      Create manually
                    </div>
                    <div className="mt-1 text-xs text-zinc-400">
                      Fill out the form and optionally attach a file.
                    </div>
                  </button>

                  <button
                    type="button"
                    className="cursor-not-allowed rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-left opacity-60"
                  >
                    <div className="text-sm font-medium text-zinc-100">
                      Upload declaration of division
                    </div>
                    <div className="mt-1 text-xs text-zinc-400">
                      AI will analyze it and prefill entities. (Coming soon)
                    </div>
                  </button>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    className="h-10 rounded-lg border border-zinc-800 bg-transparent px-4 text-sm text-zinc-200 hover:bg-zinc-900"
                    onClick={() => {
                      setIsOpen(false);
                      setCreatedPropertyId(null);
                      setError(null);
                      setCreateStep('manual');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {createStep === 'manual' && (
              <form
                onSubmit={onSubmit}
                className="flex flex-col gap-4 px-5 py-4"
              >
                <div className="grid gap-2">
                  <label className="text-sm text-zinc-300" htmlFor="name">
                    Property name<span className="ml-1 text-red-400">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-zinc-700"
                    placeholder="e.g. Sonnenallee 12"
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
                      <span className="ml-1 text-red-400">*</span>
                    </label>
                    <select
                      id="managementType"
                      name="managementType"
                      className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 pl-3 pr-10 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                      defaultValue="WEG"
                      required
                    >
                      <option value="WEG">WEG</option>
                      <option value="MV">MV</option>
                    </select>
                  </div>

                  <div className="grid min-w-0 gap-2">
                    <label
                      className="truncate text-sm text-zinc-300"
                      htmlFor="file"
                    >
                      Teilungserklärung
                    </label>
                    <input
                      id="file"
                      name="file"
                      type="file"
                      className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-0 text-sm text-zinc-300 file:mr-3 file:my-1 file:h-8 file:rounded-md file:border-0 file:bg-zinc-800 file:px-3 file:text-xs file:font-medium file:text-zinc-100 hover:file:bg-zinc-700"
                    />
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="grid min-w-0 gap-2">
                    <label
                      className="text-sm text-zinc-300"
                      htmlFor="managerId"
                    >
                      Manager<span className="ml-1 text-red-400">*</span>
                    </label>
                    <select
                      id="managerId"
                      name="managerId"
                      className="h-10 w-full truncate rounded-lg border border-zinc-800 bg-zinc-900 pl-3 pr-10 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                      required
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Select manager…
                      </option>
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
                      Accountant<span className="ml-1 text-red-400">*</span>
                    </label>
                    <select
                      id="accountantId"
                      name="accountantId"
                      className="h-10 w-full truncate rounded-lg border border-zinc-800 bg-zinc-900 pl-3 pr-10 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                      required
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Select accountant…
                      </option>
                      {accountants.map((a) => (
                        <option key={a.id} value={String(a.id)}>
                          {a.name} ({a.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg border border-red-900/40 bg-red-950/30 px-3 py-2 text-sm text-red-200">
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    className="h-10 rounded-lg border border-zinc-800 bg-transparent px-4 text-sm text-zinc-200 hover:bg-zinc-900"
                    onClick={() => {
                      setIsOpen(false);
                      setCreatedPropertyId(null);
                      setError(null);
                      setCreateStep('manual');
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="h-10 rounded-lg bg-zinc-100 px-4 text-sm font-medium text-zinc-950 hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating…' : 'Create'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
