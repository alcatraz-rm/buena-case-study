import { notFound } from 'next/navigation';
import { PropertyDetailClient } from '../../components/PropertyDetailClient';

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

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed (${res.status})`);
  }
  return (await res.json()) as T;
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = await params;
  const id = Number(propertyId);
  if (!Number.isFinite(id)) notFound();

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

  let property: Property;
  try {
    property = await getJson<Property>(`${apiBaseUrl}/properties/${id}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('404')) notFound();
    throw err;
  }

  const [managers, accountants, buildings] = await Promise.all([
    getJson<PersonOption[]>(`${apiBaseUrl}/managers`),
    getJson<PersonOption[]>(`${apiBaseUrl}/accountants`),
    getJson<Building[]>(`${apiBaseUrl}/properties/${id}/buildings`),
  ]);

  return (
    <PropertyDetailClient
      apiBaseUrl={apiBaseUrl}
      property={property}
      buildings={buildings}
      managers={managers}
      accountants={accountants}
    />
  );
}
