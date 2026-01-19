'use client';

import type { BuildingUnitType, Unit } from '@buena/shared';
import { useEffect, useState } from 'react';

type Props = {
  apiBaseUrl: string;
  buildingId: number;
  initialUnits: Unit[];
  onCountChange?: (count: number) => void;
  onUnitsChange?: (units: Unit[]) => void;
};

export function BuildingUnitsPanel({
  apiBaseUrl,
  buildingId,
  initialUnits,
  onCountChange,
  onUnitsChange,
}: Props) {
  const [units, setUnits] = useState<Unit[]>(initialUnits);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editUnit, setEditUnit] = useState<Unit | null>(null);
  const [editDraft, setEditDraft] = useState<{
    number: string;
    unitType: BuildingUnitType;
    floor: string;
    entrance: string;
    sizeSqm: string;
    rooms: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    onCountChange?.(units.length);
  }, [units.length, onCountChange]);

  useEffect(() => {
    onUnitsChange?.(units);
  }, [units, onUnitsChange]);

  useEffect(() => {
    if (!editUnit) {
      setEditDraft(null);
      return;
    }
    setEditDraft({
      number: editUnit.number,
      unitType: editUnit.unitType,
      floor: editUnit.floor ?? '',
      entrance: editUnit.entrance ?? '',
      sizeSqm: editUnit.sizeSqm === null ? '' : String(editUnit.sizeSqm),
      rooms: editUnit.rooms === null ? '' : String(editUnit.rooms),
    });
  }, [editUnit]);

  const isEditDirty = (() => {
    if (!editUnit || !editDraft) return false;
    const floor = editDraft.floor.trim() ? editDraft.floor.trim() : null;
    const entrance = editDraft.entrance.trim() ? editDraft.entrance.trim() : null;

    const sizeSqmStr = editDraft.sizeSqm.trim();
    const sizeSqm = sizeSqmStr ? Number(sizeSqmStr) : null;
    const roomsStr = editDraft.rooms.trim();
    const rooms = roomsStr ? Number(roomsStr) : null;

    return (
      editDraft.number.trim() !== editUnit.number ||
      editDraft.unitType !== editUnit.unitType ||
      floor !== editUnit.floor ||
      entrance !== editUnit.entrance ||
      (sizeSqmStr ? Number.isFinite(sizeSqm) && sizeSqm !== editUnit.sizeSqm : editUnit.sizeSqm !== null) ||
      (roomsStr ? Number.isFinite(rooms) && rooms !== editUnit.rooms : editUnit.rooms !== null)
    );
  })();

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreateError(null);
    setIsCreating(true);

    try {
      const formData = new FormData(e.currentTarget);
      const unitType = String(formData.get('unitType') ?? 'Apartment') as BuildingUnitType;
      const number = String(formData.get('number') ?? '').trim();
      const floorRaw = String(formData.get('floor') ?? '').trim();
      const entranceRaw = String(formData.get('entrance') ?? '').trim();
      const sizeSqmRaw = String(formData.get('sizeSqm') ?? '').trim();
      const roomsRaw = String(formData.get('rooms') ?? '').trim();

      if (!number) throw new Error('Unit number is required.');

      const payload = {
        unitType,
        number,
        floor: floorRaw ? floorRaw : null,
        entrance: entranceRaw ? entranceRaw : null,
        sizeSqm: sizeSqmRaw ? Number(sizeSqmRaw) : null,
        rooms: roomsRaw ? Number(roomsRaw) : null,
      };

      if (payload.sizeSqm !== null && !Number.isFinite(payload.sizeSqm)) {
        throw new Error('Size must be a number.');
      }
      if (payload.rooms !== null && !Number.isFinite(payload.rooms)) {
        throw new Error('Rooms must be a number.');
      }

      const res = await fetch(`${apiBaseUrl}/buildings/${buildingId}/units`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Failed to create unit (${res.status})`);
      }

      const created = (await res.json()) as Unit;
      setUnits((prev) => [created, ...prev]);
      setIsCreateOpen(false);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsCreating(false);
    }
  }

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editUnit || !editDraft) return;

    setSaveError(null);
    setIsSaving(true);

    try {
      const unitType = editDraft.unitType;
      const number = editDraft.number.trim();
      const floorRaw = editDraft.floor.trim();
      const entranceRaw = editDraft.entrance.trim();
      const sizeSqmRaw = editDraft.sizeSqm.trim();
      const roomsRaw = editDraft.rooms.trim();

      if (!number) throw new Error('Unit number is required.');

      const payload = {
        unitType,
        number,
        floor: floorRaw ? floorRaw : null,
        entrance: entranceRaw ? entranceRaw : null,
        sizeSqm: sizeSqmRaw ? Number(sizeSqmRaw) : null,
        rooms: roomsRaw ? Number(roomsRaw) : null,
      };

      if (payload.sizeSqm !== null && !Number.isFinite(payload.sizeSqm)) {
        throw new Error('Size must be a number.');
      }
      if (payload.rooms !== null && !Number.isFinite(payload.rooms)) {
        throw new Error('Rooms must be a number.');
      }

      const res = await fetch(`${apiBaseUrl}/buildings/${buildingId}/units/${editUnit.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Failed to save unit (${res.status})`);
      }

      const updated = (await res.json()) as Unit;
      setUnits((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setEditUnit(null);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsSaving(false);
    }
  }

  async function onDeleteUnit() {
    if (!editUnit) return;
    setDeleteError(null);
    setIsDeleting(true);

    try {
      const ok = window.confirm('Delete this unit?');
      if (!ok) return;

      const res = await fetch(`${apiBaseUrl}/buildings/${buildingId}/units/${editUnit.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Failed to delete unit (${res.status})`);
      }

      setUnits((prev) => prev.filter((u) => u.id !== editUnit.id));
      setEditUnit(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <section className="overflow-hidden rounded-xl border border-zinc-800">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-800 bg-zinc-900 px-5 py-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-medium text-zinc-200">Units</h2>
            <p className="text-xs text-zinc-400">Units linked to this building.</p>
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100 hover:bg-zinc-800"
            aria-label="Add unit"
            onClick={() => {
              setCreateError(null);
              setIsCreateOpen(true);
            }}
          >
            +
          </button>
        </div>

        <div className="grid grid-cols-12 gap-3 border-b border-zinc-800 bg-zinc-950 px-5 py-3 text-xs font-medium uppercase tracking-wider text-zinc-400">
          <div className="col-span-4">Number</div>
          <div className="col-span-3">Type</div>
          <div className="col-span-2">Floor</div>
          <div className="col-span-1 text-right">Rooms</div>
          <div className="col-span-2 text-right">Size</div>
        </div>

        <div className="divide-y divide-zinc-900">
          {units.map((u) => (
            <button
              key={u.id}
              type="button"
              className="grid w-full cursor-pointer grid-cols-12 gap-3 px-5 py-3 text-left text-sm hover:bg-zinc-900/40"
              onClick={() => {
                setSaveError(null);
                setDeleteError(null);
                setEditUnit(u);
              }}
            >
              <div className="col-span-4 truncate font-medium text-zinc-100">
                {u.number}
              </div>
              <div className="col-span-3 truncate text-zinc-300">{u.unitType}</div>
              <div className="col-span-2 truncate text-zinc-300">{u.floor ?? '—'}</div>
              <div className="col-span-1 text-right tabular-nums text-zinc-300">
                {u.rooms ?? '—'}
              </div>
              <div className="col-span-2 text-right tabular-nums text-zinc-300">
                {u.sizeSqm ?? '—'}
              </div>
            </button>
          ))}

          {units.length === 0 && (
            <div className="px-5 py-10 text-center text-sm text-zinc-400">
              No units yet.
            </div>
          )}
        </div>
      </section>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
          <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-900 px-5 py-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-base font-semibold">New unit</h2>
                <p className="text-xs text-zinc-400">Add a unit to this building.</p>
              </div>

              <button
                type="button"
                className="rounded-md px-2 py-1 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100"
                onClick={() => setIsCreateOpen(false)}
              >
                Close
              </button>
            </div>

            <form onSubmit={onCreate} className="flex flex-col gap-4 px-5 py-4">
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm text-zinc-300" htmlFor="c-number">
                    Unit number
                  </label>
                  <input
                    id="c-number"
                    name="number"
                    className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                    placeholder="e.g. 2A"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm text-zinc-300" htmlFor="c-unitType">
                    Type
                  </label>
                  <select
                    id="c-unitType"
                    name="unitType"
                    defaultValue="Apartment"
                    className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 pl-3 pr-10 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                  >
                    <option value="Apartment">Apartment</option>
                    <option value="Office">Office</option>
                    <option value="Garden">Garden</option>
                    <option value="Parking">Parking</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm text-zinc-300" htmlFor="c-floor">
                    Floor (optional)
                  </label>
                  <input
                    id="c-floor"
                    name="floor"
                    className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                    placeholder="e.g. 2"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm text-zinc-300" htmlFor="c-entrance">
                    Entrance (optional)
                  </label>
                  <input
                    id="c-entrance"
                    name="entrance"
                    className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                    placeholder="e.g. A"
                  />
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm text-zinc-300" htmlFor="c-sizeSqm">
                    Size (sqm, optional)
                  </label>
                  <input
                    id="c-sizeSqm"
                    name="sizeSqm"
                    inputMode="decimal"
                    className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                    placeholder="e.g. 54"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm text-zinc-300" htmlFor="c-rooms">
                    Rooms (optional)
                  </label>
                  <input
                    id="c-rooms"
                    name="rooms"
                    inputMode="decimal"
                    className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                    placeholder="e.g. 2"
                  />
                </div>
              </div>

              {createError && (
                <div className="rounded-lg border border-red-900/40 bg-red-950/30 px-3 py-2 text-sm text-red-200">
                  {createError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="h-10 rounded-lg border border-zinc-800 bg-transparent px-4 text-sm text-zinc-200 hover:bg-zinc-900"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 rounded-lg bg-zinc-100 px-4 text-sm font-medium text-zinc-950 hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
                  disabled={isCreating}
                >
                  {isCreating ? 'Creating…' : 'Create unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editUnit && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
          <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-900 px-5 py-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-base font-semibold">Edit unit</h2>
                <p className="text-xs text-zinc-400">Update unit details.</p>
              </div>

              <button
                type="button"
                className="rounded-md px-2 py-1 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100"
                onClick={() => setEditUnit(null)}
              >
                Close
              </button>
            </div>

            <form onSubmit={onSave} className="flex flex-col gap-4 px-5 py-4">
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm text-zinc-300" htmlFor="e-number">
                    Unit number
                  </label>
                  <input
                    id="e-number"
                    name="number"
                    value={editDraft?.number ?? ''}
                    onChange={(e) =>
                      setEditDraft((prev) =>
                        prev ? { ...prev, number: e.target.value } : prev,
                      )
                    }
                    className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm text-zinc-300" htmlFor="e-unitType">
                    Type
                  </label>
                  <select
                    id="e-unitType"
                    name="unitType"
                    value={editDraft?.unitType ?? 'Apartment'}
                    onChange={(e) =>
                      setEditDraft((prev) =>
                        prev
                          ? {
                              ...prev,
                              unitType: e.target.value as BuildingUnitType,
                            }
                          : prev,
                      )
                    }
                    className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 pl-3 pr-10 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                  >
                    <option value="Apartment">Apartment</option>
                    <option value="Office">Office</option>
                    <option value="Garden">Garden</option>
                    <option value="Parking">Parking</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm text-zinc-300" htmlFor="e-floor">
                    Floor (optional)
                  </label>
                  <input
                    id="e-floor"
                    name="floor"
                    value={editDraft?.floor ?? ''}
                    onChange={(e) =>
                      setEditDraft((prev) =>
                        prev ? { ...prev, floor: e.target.value } : prev,
                      )
                    }
                    className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                    placeholder="e.g. 2"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm text-zinc-300" htmlFor="e-entrance">
                    Entrance (optional)
                  </label>
                  <input
                    id="e-entrance"
                    name="entrance"
                    value={editDraft?.entrance ?? ''}
                    onChange={(e) =>
                      setEditDraft((prev) =>
                        prev ? { ...prev, entrance: e.target.value } : prev,
                      )
                    }
                    className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                    placeholder="e.g. A"
                  />
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm text-zinc-300" htmlFor="e-sizeSqm">
                    Size (sqm, optional)
                  </label>
                  <input
                    id="e-sizeSqm"
                    name="sizeSqm"
                    value={editDraft?.sizeSqm ?? ''}
                    onChange={(e) =>
                      setEditDraft((prev) =>
                        prev ? { ...prev, sizeSqm: e.target.value } : prev,
                      )
                    }
                    inputMode="decimal"
                    className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                    placeholder="e.g. 54"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm text-zinc-300" htmlFor="e-rooms">
                    Rooms (optional)
                  </label>
                  <input
                    id="e-rooms"
                    name="rooms"
                    value={editDraft?.rooms ?? ''}
                    onChange={(e) =>
                      setEditDraft((prev) =>
                        prev ? { ...prev, rooms: e.target.value } : prev,
                      )
                    }
                    inputMode="decimal"
                    className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                    placeholder="e.g. 2"
                  />
                </div>
              </div>

              {(saveError || deleteError) && (
                <div className="rounded-lg border border-red-900/40 bg-red-950/30 px-3 py-2 text-sm text-red-200">
                  {saveError ?? deleteError}
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  className="h-10 rounded-lg border border-red-900/50 bg-transparent px-4 text-sm text-red-200 hover:bg-red-950/40 disabled:opacity-60"
                  onClick={onDeleteUnit}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting…' : 'Delete'}
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="h-10 rounded-lg border border-zinc-800 bg-transparent px-4 text-sm text-zinc-200 hover:bg-zinc-900"
                    onClick={() => setEditUnit(null)}
                    disabled={isSaving || isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 rounded-lg bg-zinc-100 px-4 text-sm font-medium text-zinc-950 hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
                    disabled={isSaving || isDeleting || !isEditDirty}
                  >
                    {isSaving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

