import type { Building, PersonOption, Property } from '@buena/types';
import { notFound } from 'next/navigation';
import { PropertyDetailClient } from '~/app/components/PropertyDetailClient';
import {
  getApiBaseUrlForClient,
  getApiBaseUrlForServer,
} from '~/app/lib/api-base-url';

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Request failed (${response.status})`);
  }
  return (await response.json()) as T;
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = await params;
  const id = Number(propertyId);
  if (!Number.isFinite(id)) {
    notFound();
  }

  const apiBaseUrlServer = getApiBaseUrlForServer();
  const apiBaseUrlClient = getApiBaseUrlForClient();

  let property: Property;
  try {
    property = await getJson<Property>(`${apiBaseUrlServer}/properties/${id}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('404')) {
      notFound();
    }
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
