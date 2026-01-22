import type { Building, PersonOption, Property } from '@buena/types';
import { notFound } from 'next/navigation';
import { PropertyDetailClient } from '../../components/PropertyDetailClient';
import {
  getApiBaseUrlForClient,
  getApiBaseUrlForServer,
} from '../../lib/api-base-url';

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

  const apiBaseUrlServer = getApiBaseUrlForServer();
  const apiBaseUrlClient = getApiBaseUrlForClient();

  let property: Property;
  try {
    property = await getJson<Property>(`${apiBaseUrlServer}/properties/${id}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('404')) notFound();
    throw err;
  }

  const [managers, accountants, buildings] = await Promise.all([
    getJson<PersonOption[]>(`${apiBaseUrlServer}/managers`),
    getJson<PersonOption[]>(`${apiBaseUrlServer}/accountants`),
    getJson<Building[]>(`${apiBaseUrlServer}/properties/${id}/buildings`),
  ]);

  return (
    <PropertyDetailClient
      apiBaseUrl={apiBaseUrlClient}
      property={property}
      buildings={buildings}
      managers={managers}
      accountants={accountants}
    />
  );
}
