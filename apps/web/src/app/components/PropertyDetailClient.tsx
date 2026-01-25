'use client';

import type {
  Building,
  ManagementType,
  PersonOption,
  Property,
  UpdatePropertyDto,
} from '@buena/types';
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
};

export function PropertyDetailClient({
  apiBaseUrl,
  property: initialProperty,
  buildings: initialBuildings,
  managers,
  accountants,
}: Props) {
  const router = useRouter();
  const [isFormCollapsed, setIsFormCollapsed] = useState(true);

  const [property, setProperty] = useState<Property>(initialProperty);
  const [declarationMeta, setDeclarationMeta] = useState<{
    originalName: string;
    sizeBytes: number;
  } | null>(null);
  const [isDeclarationLoading, setIsDeclarationLoading] = useState(false);
  const [isDeclarationDownloading, setIsDeclarationDownloading] =
    useState(false);
  const [isDeclarationRemoving, setIsDeclarationRemoving] = useState(false);
  const [isDeclarationUploading, setIsDeclarationUploading] = useState(false);
  const [name, setName] = useState(initialProperty.name);
  const [managementType, setManagementType] = useState<ManagementType>(
    initialProperty.managementType,
  );
  const [managerId, setManagerId] = useState<number>(initialProperty.managerId);
  const [accountantId, setAccountantId] = useState<number>(
    initialProperty.accountantId,
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState<string | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!saveOk) return;
    const timeout = window.setTimeout(() => setSaveOk(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [saveOk]);

  const managerLabelById = useMemo(() => {
    return new Map(managers.map((manager) => [manager.id, manager.name]));
  }, [managers]);

  const accountantLabelById = useMemo(() => {
    return new Map(
      accountants.map((accountant) => [accountant.id, accountant.name]),
    );
  }, [accountants]);

  useEffect(() => {
    const fileId = property.declarationOfDivisionFileId;
    if (!fileId) {
      setDeclarationMeta(null);
      setIsDeclarationLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsDeclarationLoading(true);
    void (async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/stored-files/${fileId}/meta`, {
          cache: 'no-store',
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error('Failed to load file metadata');
        }

        const json = (await res.json()) as {
          originalName: string;
          sizeBytes: number;
        };

        setDeclarationMeta({
          originalName: json.originalName,
          sizeBytes: json.sizeBytes,
        });
      } catch {
        setDeclarationMeta(null);
      } finally {
        setIsDeclarationLoading(false);
      }
    })();

    return () => controller.abort();
  }, [apiBaseUrl, property.declarationOfDivisionFileId]);

  function formatBytes(bytes: number): string {
    if (!Number.isFinite(bytes) || bytes < 0) {
      return '—';
    }
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    const kb = bytes / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`;
    }

    const mb = kb / 1024;
    if (mb < 1024) {
      return `${mb.toFixed(1)} MB`;
    }

    const gb = mb / 1024;
    return `${gb.toFixed(1)} GB`;
  }

  async function downloadDeclarationOfDivision(fileId: string) {
    try {
      setIsDeclarationDownloading(true);
      const response = await fetch(`${apiBaseUrl}/stored-files/${fileId}`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(text || `Download failed (${response.status})`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = declarationMeta?.originalName ?? 'declaration';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Download failed.');
    } finally {
      setIsDeclarationDownloading(false);
    }
  }

  async function removeDeclarationOfDivision() {
    if (!property.declarationOfDivisionFileId) {
      return;
    }

    try {
      setIsDeclarationRemoving(true);
      setSaveError(null);

      const response = await fetch(
        `${apiBaseUrl}/properties/${property.id}/declaration-of-division`,
        { method: 'DELETE' },
      );

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(text || `Failed to remove file (${response.status})`);
      }
      const updated = (await response.json()) as Property;

      setProperty(updated);
      setSaveOk('Removed.');
      router.refresh();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Remove failed.');
    } finally {
      setIsDeclarationRemoving(false);
    }
  }

  async function uploadNewDeclarationOfDivision(file: File) {
    try {
      setIsDeclarationUploading(true);
      setSaveError(null);
      const upload = new FormData();
      upload.append('file', file);

      const response = await fetch(
        `${apiBaseUrl}/properties/${property.id}/declaration-of-division`,
        { method: 'POST', body: upload },
      );

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(text || `Upload failed (${response.status})`);
      }
      const updated = (await response.json()) as Property;
      setProperty(updated);
      setSaveOk('Uploaded.');
      router.refresh();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setIsDeclarationUploading(false);
    }
  }

  const isDirty =
    name !== property.name ||
    managementType !== property.managementType ||
    managerId !== property.managerId ||
    accountantId !== property.accountantId;

  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (!isDirty) {
        return;
      }
      event.preventDefault();
    }

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  function confirmNavigate(): boolean {
    if (!isDirty) {
      return true;
    }
    return window.confirm('You have unsaved changes. Leave this page?');
  }

  async function onSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveError(null);
    setSaveOk(null);
    setIsSaving(true);

    try {
      const nextName = name.trim();
      if (!nextName) {
        throw new Error('Name is required.');
      }
      if (!Number.isFinite(managerId)) {
        throw new Error('Manager is required.');
      }
      if (!Number.isFinite(accountantId)) {
        throw new Error('Accountant is required.');
      }

      const response = await fetch(`${apiBaseUrl}/properties/${property.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: nextName,
          managementType,
          managerId,
          accountantId,
        } satisfies UpdatePropertyDto),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(text || `Failed to save (${response.status})`);
      }

      const updated = (await response.json()) as Property;

      setProperty(updated);
      setName(updated.name);
      setManagementType(updated.managementType);
      setManagerId(updated.managerId);
      setAccountantId(updated.accountantId);
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
      if (!ok) {
        return;
      }

      const response = await fetch(`${apiBaseUrl}/properties/${property.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(text || `Failed to delete (${response.status})`);
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
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-900/50 bg-transparent text-red-200 hover:bg-red-950/40 disabled:opacity-60"
              onClick={onDelete}
              disabled={isDeleting}
              aria-label={isDeleting ? 'Deleting property…' : 'Delete property'}
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
                {property.managementType} · Manager:{' '}
                {managerLabelById.get(property.managerId) ??
                  `#${property.managerId}`}{' '}
                · Accountant:{' '}
                {accountantLabelById.get(property.accountantId) ??
                  `#${property.accountantId}`}
                {' · '}
                Declaration of division:{' '}
                {property.declarationOfDivisionFileId
                  ? isDeclarationLoading
                    ? 'loading…'
                    : declarationMeta
                      ? `${declarationMeta.originalName} (${formatBytes(declarationMeta.sizeBytes)})`
                      : 'available'
                  : '—'}
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
                : 'max-h-[1200px] opacity-100',
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
                <label className="text-sm text-zinc-300" htmlFor="name">
                  Property name<span className="ml-1 text-red-400">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
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
                    Management type<span className="ml-1 text-red-400">*</span>
                  </label>
                  <select
                    id="managementType"
                    name="managementType"
                    className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 pl-3 pr-10 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                    value={managementType}
                    onChange={(event) =>
                      setManagementType(event.target.value as ManagementType)
                    }
                    required
                  >
                    <option value="WEG">WEG</option>
                    <option value="MV">MV</option>
                  </select>
                </div>

                <div className="grid min-w-0 gap-2">
                  <label className="text-sm text-zinc-300">
                    Declaration of division
                  </label>
                  <div className="flex h-10 items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-900 px-3">
                    <div className="min-w-0 truncate text-sm text-zinc-400">
                      {property.declarationOfDivisionFileId
                        ? isDeclarationLoading
                          ? 'Loading…'
                          : declarationMeta
                            ? `${declarationMeta.originalName} · ${formatBytes(declarationMeta.sizeBytes)}`
                            : 'File available'
                        : 'No file'}
                    </div>

                    <div className="flex items-center gap-2">
                      {property.declarationOfDivisionFileId && (
                        <>
                          <button
                            type="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-30"
                            aria-label="Download file"
                            disabled={isDeclarationDownloading}
                            onClick={() =>
                              void downloadDeclarationOfDivision(
                                property.declarationOfDivisionFileId as string,
                              )
                            }
                          >
                            {isDeclarationDownloading ? (
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
                                <path d="M12 3v12" />
                                <path d="M7 10l5 5 5-5" />
                                <path d="M5 21h14" />
                              </svg>
                            )}
                          </button>

                          <button
                            type="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-900/50 bg-zinc-950 text-red-200 hover:bg-red-950/40 disabled:cursor-not-allowed disabled:opacity-30"
                            aria-label="Remove file"
                            disabled={
                              isDeclarationRemoving || isDeclarationUploading
                            }
                            onClick={() => void removeDeclarationOfDivision()}
                          >
                            {isDeclarationRemoving ? (
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
                        </>
                      )}

                      <label
                        className={[
                          'inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100 hover:bg-zinc-800',
                          isDeclarationUploading || isDeclarationRemoving
                            ? 'cursor-not-allowed opacity-30'
                            : '',
                        ].join(' ')}
                        aria-label="Upload new file"
                      >
                        <input
                          type="file"
                          className="hidden"
                          disabled={
                            isDeclarationUploading || isDeclarationRemoving
                          }
                          onChange={(e) => {
                            const f = e.currentTarget.files?.[0] ?? null;
                            e.currentTarget.value = '';
                            if (!f) return;

                            if (property.declarationOfDivisionFileId) {
                              const ok = window.confirm(
                                'Upload a new file? The old file will be deleted.',
                              );
                              if (!ok) return;
                            }

                            void uploadNewDeclarationOfDivision(f);
                          }}
                        />
                        {isDeclarationUploading ? (
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
                            <path d="M12 3v12" />
                            <path d="M8 7l4-4 4 4" />
                            <path d="M5 21h14" />
                          </svg>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid min-w-0 gap-2">
                  <label className="text-sm text-zinc-300" htmlFor="managerId">
                    Manager<span className="ml-1 text-red-400">*</span>
                  </label>
                  <select
                    id="managerId"
                    name="managerId"
                    className="h-10 w-full truncate rounded-lg border border-zinc-800 bg-zinc-900 pl-3 pr-10 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                    value={String(managerId)}
                    onChange={(e) => setManagerId(Number(e.target.value))}
                    required
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
                    Accountant<span className="ml-1 text-red-400">*</span>
                  </label>
                  <select
                    id="accountantId"
                    name="accountantId"
                    className="h-10 w-full truncate rounded-lg border border-zinc-800 bg-zinc-900 pl-3 pr-10 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                    value={String(accountantId)}
                    onChange={(event) =>
                      setAccountantId(Number(event.target.value))
                    }
                    required
                  >
                    {accountants.map((accountant) => (
                      <option key={accountant.id} value={String(accountant.id)}>
                        {accountant.name} ({accountant.email})
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
                  className="h-10 rounded-lg bg-zinc-100 px-4 text-sm font-medium text-zinc-950 hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
                  disabled={isSaving || !isDirty}
                >
                  {isSaving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </section>

        <PropertyBuildingsPanel
          apiBaseUrl={apiBaseUrl}
          propertyId={property.id}
          initialBuildings={initialBuildings}
        />
      </div>
    </div>
  );
}
