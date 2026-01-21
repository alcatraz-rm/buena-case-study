import type { Building, Property, Unit } from '@buena/shared';
import { notFound } from 'next/navigation';
import { BuildingDetailClient } from '../../../../components/BuildingDetailClient';
import {
  getApiBaseUrlForClient,
  getApiBaseUrlForServer,
} from '../../../../lib/api-base-url';

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

  const apiBaseUrlServer = getApiBaseUrlForServer();
  const apiBaseUrlClient = getApiBaseUrlForClient();

  const [property, building, units] = await Promise.all([
    getJson<Property>(`${apiBaseUrlServer}/properties/${pid}`),
    getJson<Building>(`${apiBaseUrlServer}/buildings/${bid}`),
    getJson<Unit[]>(`${apiBaseUrlServer}/buildings/${bid}/units`),
  ]);

  if (building.propertyId !== property.id) notFound();

  return (
    <BuildingDetailClient
      apiBaseUrl={apiBaseUrlClient}
      property={property}
      building={building}
      units={units}
    />
  );
}
