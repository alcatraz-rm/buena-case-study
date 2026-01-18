import { notFound } from 'next/navigation';
import { BuildingDetailClient } from '../../../../components/BuildingDetailClient';

type Property = {
  id: number;
  name: string;
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

type BuildingUnitType = 'Apartment' | 'Office' | 'Garden' | 'Parking';

type Unit = {
  id: number;
  buildingId: number;
  unitType: BuildingUnitType;
  number: string;
  floor: string | null;
  entrance: string | null;
  sizeSqm: number | null;
  rooms: number | null;
  createdAt: string;
  updatedAt: string;
};

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

