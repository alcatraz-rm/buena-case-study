import type { Building, Property, Unit } from '@buena/shared';
import { notFound } from 'next/navigation';
import { BuildingDetailClient } from '../../../../components/BuildingDetailClient';

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed (${res.status})`);
  }
  return (await res.json()) as T;
}

export default async function BuildingPage({
  params,
}: {
  params: Promise<{ propertyId: string; buildingId: string }>;
}) {
  const { propertyId, buildingId } = await params;
  const pid = Number(propertyId);
  const bid = Number(buildingId);
  if (!Number.isFinite(pid) || !Number.isFinite(bid)) notFound();

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

  const [property, building, units] = await Promise.all([
    getJson<Property>(`${apiBaseUrl}/properties/${pid}`),
    getJson<Building>(`${apiBaseUrl}/buildings/${bid}`),
    getJson<Unit[]>(`${apiBaseUrl}/buildings/${bid}/units`),
  ]);

  if (building.propertyId !== property.id) notFound();

  return (
    <BuildingDetailClient
      apiBaseUrl={apiBaseUrl}
      property={property}
      building={building}
      units={units}
    />
  );
}

