'use client';

import type { BuildingUnitType, Unit } from '@buena/types';
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
    description: string;
    floor: string;
    entrance: string;
    sizeSqm: string;
    coOwnershipShare: string;
    constructionYear: string;
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
      description: editUnit.description ?? '',
      floor: editUnit.floor ?? '',
      entrance: editUnit.entrance ?? '',
      sizeSqm: editUnit.sizeSqm === null ? '' : String(editUnit.sizeSqm),
      coOwnershipShare: editUnit.coOwnershipShare ?? '',
      constructionYear:
        editUnit.constructionYear === null
          ? ''
          : String(editUnit.constructionYear),
      rooms: editUnit.rooms === null ? '' : String(editUnit.rooms),
    });
  }, [editUnit]);

  const isEditDirty = (() => {
    if (!editUnit || !editDraft) {
      return false;
    }
    const description = editDraft.description.trim()
      ? editDraft.description.trim()
      : null;

    const floor = editDraft.floor.trim() ? editDraft.floor.trim() : null;

    const entrance = editDraft.entrance.trim()
      ? editDraft.entrance.trim()
      : null;

    const sizeSqmStr = editDraft.sizeSqm.trim();
    const sizeSqm = sizeSqmStr ? Number(sizeSqmStr) : null;

    const coOwnershipShare = editDraft.coOwnershipShare.trim()
      ? editDraft.coOwnershipShare.trim()
      : null;

    const constructionYearStr = editDraft.constructionYear.trim();
    const constructionYear = constructionYearStr
      ? Number(constructionYearStr)
      : null;

    const roomsStr = editDraft.rooms.trim();
    const rooms = roomsStr ? Number(roomsStr) : null;

    const numberChanged = editDraft.number.trim() !== editUnit.number;
    const unitTypeChanged = editDraft.unitType !== editUnit.unitType;
    const descriptionChanged = description !== editUnit.description;
    const floorChanged = floor !== editUnit.floor;
    const entranceChanged = entrance !== editUnit.entrance;
    const coOwnershipShareChanged =
      coOwnershipShare !== editUnit.coOwnershipShare;

    const sizeSqmChanged = sizeSqmStr
      ? Number.isFinite(sizeSqm) && sizeSqm !== editUnit.sizeSqm
      : editUnit.sizeSqm !== null;

    const constructionYearChanged = constructionYearStr
      ? Number.isFinite(constructionYear) &&
        constructionYear !== editUnit.constructionYear
      : editUnit.constructionYear !== null;

    const roomsChanged = roomsStr
      ? Number.isFinite(rooms) && rooms !== editUnit.rooms
      : editUnit.rooms !== null;

    return (
      numberChanged ||
      unitTypeChanged ||
      descriptionChanged ||
      floorChanged ||
      entranceChanged ||
      sizeSqmChanged ||
      coOwnershipShareChanged ||
      constructionYearChanged ||
      roomsChanged
    );
  })();

  async function onCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreateError(null);
    setIsCreating(true);

    try {
      const formData = new FormData(event.currentTarget);

      const unitType = String(
        formData.get('unitType') ?? 'Apartment',
      ) as BuildingUnitType;
      const number = String(formData.get('number') ?? '').trim();
      const descriptionRaw = String(formData.get('description') ?? '').trim();
      const floorRaw = String(formData.get('floor') ?? '').trim();
      const entranceRaw = String(formData.get('entrance') ?? '').trim();
      const sizeSqmRaw = String(formData.get('sizeSqm') ?? '').trim();
      const coOwnershipShareRaw = String(
        formData.get('coOwnershipShare') ?? '',
      ).trim();
      const constructionYearRaw = String(
        formData.get('constructionYear') ?? '',
      ).trim();
      const roomsRaw = String(formData.get('rooms') ?? '').trim();

      if (!number) throw new Error('Unit number is required.');

      const payload = {
        unitType,
        number,
        description: descriptionRaw ?? null,
        floor: floorRaw ?? null,
        entrance: entranceRaw ?? null,
        sizeSqm: sizeSqmRaw ? Number(sizeSqmRaw) : null,
        coOwnershipShare: coOwnershipShareRaw ?? null,
        constructionYear: constructionYearRaw
          ? Number(constructionYearRaw)
          : null,
        rooms: roomsRaw ? Number(roomsRaw) : null,
      };

      if (payload.sizeSqm !== null && !Number.isFinite(payload.sizeSqm)) {
        throw new Error('Size must be a number.');
      }

      if (
        payload.constructionYear !== null &&
        !Number.isFinite(payload.constructionYear)
      ) {
        throw new Error('Construction year must be a number.');
      }

      if (payload.rooms !== null && !Number.isFinite(payload.rooms)) {
        throw new Error('Rooms must be a number.');
      }

      const response = await fetch(
        `${apiBaseUrl}/buildings/${buildingId}/units`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(text || `Failed to create unit (${response.status})`);
      }

      const created = (await response.json()) as Unit;
      setUnits((prev) => [created, ...prev]);
      setIsCreateOpen(false);
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : 'Something went wrong.',
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function onSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editUnit || !editDraft) {
      return;
    }

    setSaveError(null);
    setIsSaving(true);

    try {
      const unitType = editDraft.unitType;
      const number = editDraft.number.trim();
      const descriptionRaw = editDraft.description.trim();
      const floorRaw = editDraft.floor.trim();
      const entranceRaw = editDraft.entrance.trim();
      const sizeSqmRaw = editDraft.sizeSqm.trim();
      const coOwnershipShareRaw = editDraft.coOwnershipShare.trim();
      const constructionYearRaw = editDraft.constructionYear.trim();
      const roomsRaw = editDraft.rooms.trim();

      if (!number) {
        throw new Error('Unit number is required.');
      }

      const payload = {
        unitType,
        number,
        description: descriptionRaw ?? null,
        floor: floorRaw ?? null,
        entrance: entranceRaw ?? null,
        sizeSqm: sizeSqmRaw ? Number(sizeSqmRaw) : null,
        coOwnershipShare: coOwnershipShareRaw ?? null,
        constructionYear: constructionYearRaw
          ? Number(constructionYearRaw)
          : null,
        rooms: roomsRaw ? Number(roomsRaw) : null,
      };

      if (payload.sizeSqm !== null && !Number.isFinite(payload.sizeSqm)) {
        throw new Error('Size must be a number.');
      }
      if (
        payload.constructionYear !== null &&
        !Number.isFinite(payload.constructionYear)
      ) {
        throw new Error('Construction year must be a number.');
      }
      if (payload.rooms !== null && !Number.isFinite(payload.rooms)) {
        throw new Error('Rooms must be a number.');
      }

      const response = await fetch(
        `${apiBaseUrl}/buildings/${buildingId}/units/${editUnit.id}`,
        {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(text || `Failed to save unit (${response.status})`);
      }

      const updated = (await response.json()) as Unit;
      setUnits((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setEditUnit(null);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : 'Something went wrong.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function onDeleteUnit() {
    if (!editUnit) {
      return;
    }
    setDeleteError(null);
    setIsDeleting(true);

    try {
      const ok = window.confirm('Delete this unit?');
      if (!ok) {
        return;
      }

      const response = await fetch(
        `${apiBaseUrl}/buildings/${buildingId}/units/${editUnit.id}`,
        {
          method: 'DELETE',
        },
      );

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(text || `Failed to delete unit (${response.status})`);
      }

      setUnits((prev) => prev.filter((u) => u.id !== editUnit.id));
      setEditUnit(null);
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : 'Something went wrong.',
      );
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
            <p className="text-xs text-zinc-400">
              Units linked to this building.
            </p>
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

        <div className="grid grid-cols-12 items-center gap-3 border-b border-zinc-800 bg-zinc-950 px-5 py-3 text-xs font-medium uppercase tracking-wider text-zinc-400">
          <div className="col-span-4">Number</div>
          <div className="col-span-3">Type</div>
          <div className="col-span-2">Floor</div>
          <div className="col-span-1 text-right">Rooms</div>
          <div className="col-span-2 text-right">Size</div>
        </div>

        <div className="divide-y divide-zinc-900">
          {units.map((unit) => (
            <div
              key={unit.id}
              className="grid w-full cursor-pointer grid-cols-12 items-center gap-3 px-5 py-3 text-left text-sm hover:bg-zinc-900/40"
              onClick={() => {
                setSaveError(null);
                setDeleteError(null);
                setEditUnit(unit);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setSaveError(null);
                  setDeleteError(null);
                  setEditUnit(unit);
                }
              }}
            >
              <div className="col-span-4 truncate font-medium leading-none text-zinc-100">
                {unit.number}
              </div>
              <div className="col-span-3 truncate leading-none text-zinc-300">
                {unit.unitType}
              </div>
              <div className="col-span-2 truncate leading-none text-zinc-300">
                {unit.floor ?? '—'}
              </div>
              <div className="col-span-1 text-right tabular-nums leading-none text-zinc-300">
                {unit.rooms ?? '—'}
              </div>
              <div className="col-span-2 text-right tabular-nums leading-none text-zinc-300">
                {unit.sizeSqm ?? '—'}
              </div>
            </div>
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
                <p className="text-xs text-zinc-400">
                  Add a unit to this building.
                </p>
              </div>
            </div>

            <form onSubmit={onCreate} className="flex flex-col gap-4 px-5 py-4">
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm text-zinc-300" htmlFor="c-number">
                    Unit number<span className="ml-1 text-red-400">*</span>
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
                    Type<span className="ml-1 text-red-400">*</span>
                  </label>
                  <select
                    id="c-unitType"
                    name="unitType"
                    defaultValue="Apartment"
                    className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 pl-3 pr-10 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                    required
                  >
                    <option value="Apartment">Apartment</option>
                    <option value="Office">Office</option>
                    <option value="Garden">Garden</option>
                    <option value="Parking">Parking</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-2">
                <label
                  className="text-sm text-zinc-300"
                  htmlFor="c-description"
                >
                  Description
                </label>
                <textarea
                  id="c-description"
                  name="description"
                  rows={3}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                  placeholder="e.g. 2-room apartment with balcony"
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm text-zinc-300" htmlFor="c-floor">
                    Floor
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
                    Entrance
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
                    Size (sqm)
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
                    Rooms
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

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label
                    className="text-sm text-zinc-300"
                    htmlFor="c-constructionYear"
                  >
                    Construction year
                  </label>
                  <input
                    id="c-constructionYear"
                    name="constructionYear"
                    inputMode="numeric"
                    className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                    placeholder="e.g. 1998"
                  />
                </div>
                <div className="grid gap-2">
                  <label
                    className="text-sm text-zinc-300"
                    htmlFor="c-coOwnershipShare"
                  >
                    Co-ownership share
                  </label>
                  <input
                    id="c-coOwnershipShare"
                    name="coOwnershipShare"
                    className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                    placeholder="e.g. 45/1000"
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
            </div>

            <form onSubmit={onSave} className="flex flex-col gap-4 px-5 py-4">
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm text-zinc-300" htmlFor="e-number">
                    Unit number<span className="ml-1 text-red-400">*</span>
                  </label>
                  <input
                    id="e-number"
                    name="number"
                    value={editDraft?.number ?? ''}
                    onChange={(event) =>
                      setEditDraft((prev) =>
                        prev ? { ...prev, number: event.target.value } : prev,
                      )
                    }
                    className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm text-zinc-300" htmlFor="e-unitType">
                    Type<span className="ml-1 text-red-400">*</span>
                  </label>
                  <select
                    id="e-unitType"
                    name="unitType"
                    value={editDraft?.unitType ?? 'Apartment'}
                    onChange={(event) =>
                      setEditDraft((prev) =>
                        prev
                          ? {
                              ...prev,
                              unitType: event.target.value as BuildingUnitType,
                            }
                          : prev,
                      )
                    }
                    className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 pl-3 pr-10 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                    required
                  >
                    <option value="Apartment">Apartment</option>
                    <option value="Office">Office</option>
                    <option value="Garden">Garden</option>
                    <option value="Parking">Parking</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-2">
                <label
                  className="text-sm text-zinc-300"
                  htmlFor="e-description"
                >
                  Description
                </label>
                <textarea
                  id="e-description"
                  name="description"
                  rows={3}
                  value={editDraft?.description ?? ''}
                  onChange={(event) =>
                    setEditDraft((prev) =>
                      prev
                        ? { ...prev, description: event.target.value }
                        : prev,
                    )
                  }
                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                  placeholder="e.g. 2-room apartment with balcony"
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm text-zinc-300" htmlFor="e-floor">
                    Floor
                  </label>
                  <input
                    id="e-floor"
                    name="floor"
                    value={editDraft?.floor ?? ''}
                    onChange={(event) =>
                      setEditDraft((prev) =>
                        prev ? { ...prev, floor: event.target.value } : prev,
                      )
                    }
                    className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                    placeholder="e.g. 2"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm text-zinc-300" htmlFor="e-entrance">
                    Entrance
                  </label>
                  <input
                    id="e-entrance"
                    name="entrance"
                    value={editDraft?.entrance ?? ''}
                    onChange={(event) =>
                      setEditDraft((prev) =>
                        prev ? { ...prev, entrance: event.target.value } : prev,
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
                    Size (sqm)
                  </label>
                  <input
                    id="e-sizeSqm"
                    name="sizeSqm"
                    value={editDraft?.sizeSqm ?? ''}
                    onChange={(event) =>
                      setEditDraft((prev) =>
                        prev ? { ...prev, sizeSqm: event.target.value } : prev,
                      )
                    }
                    inputMode="decimal"
                    className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                    placeholder="e.g. 54"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm text-zinc-300" htmlFor="e-rooms">
                    Rooms
                  </label>
                  <input
                    id="e-rooms"
                    name="rooms"
                    value={editDraft?.rooms ?? ''}
                    onChange={(event) =>
                      setEditDraft((prev) =>
                        prev ? { ...prev, rooms: event.target.value } : prev,
                      )
                    }
                    inputMode="decimal"
                    className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                    placeholder="e.g. 2"
                  />
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label
                    className="text-sm text-zinc-300"
                    htmlFor="e-constructionYear"
                  >
                    Construction year
                  </label>
                  <input
                    id="e-constructionYear"
                    name="constructionYear"
                    inputMode="numeric"
                    value={editDraft?.constructionYear ?? ''}
                    onChange={(event) =>
                      setEditDraft((prev) =>
                        prev
                          ? { ...prev, constructionYear: event.target.value }
                          : prev,
                      )
                    }
                    className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                    placeholder="e.g. 1998"
                  />
                </div>
                <div className="grid gap-2">
                  <label
                    className="text-sm text-zinc-300"
                    htmlFor="e-coOwnershipShare"
                  >
                    Co-ownership share
                  </label>
                  <input
                    id="e-coOwnershipShare"
                    name="coOwnershipShare"
                    value={editDraft?.coOwnershipShare ?? ''}
                    onChange={(event) =>
                      setEditDraft((prev) =>
                        prev
                          ? { ...prev, coOwnershipShare: event.target.value }
                          : prev,
                      )
                    }
                    className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-100 outline-none focus:border-zinc-700"
                    placeholder="e.g. 45/1000"
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
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-900/50 bg-transparent text-red-200 hover:bg-red-950/40 disabled:opacity-60"
                  onClick={onDeleteUnit}
                  disabled={isDeleting}
                  aria-label={isDeleting ? 'Deleting unit…' : 'Delete unit'}
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
