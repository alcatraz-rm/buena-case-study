import type { PersonOption, PropertyListItem } from '@buena/types';
import { PropertiesPageClient } from './components/PropertiesPageClient';
import {
  getApiBaseUrlForClient,
  getApiBaseUrlForServer,
} from './lib/api-base-url';

async function getProperties(): Promise<PropertyListItem[]> {
  const baseUrl = getApiBaseUrlForServer();
  const res = await fetch(`${baseUrl}/properties`, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error(`Failed to load properties (${res.status})`);
  }

  return (await res.json()) as PropertyListItem[];
}

async function getManagers(): Promise<PersonOption[]> {
  const baseUrl = getApiBaseUrlForServer();
  const res = await fetch(`${baseUrl}/managers`, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error(`Failed to load managers (${res.status})`);
  }

  return (await res.json()) as PersonOption[];
}

async function getAccountants(): Promise<PersonOption[]> {
  const baseUrl = getApiBaseUrlForServer();
  const res = await fetch(`${baseUrl}/accountants`, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error(`Failed to load accountants (${res.status})`);
  }

  return (await res.json()) as PersonOption[];
}

export default async function Home() {
  const properties = await getProperties();
  const [managers, accountants] = await Promise.all([
    getManagers(),
    getAccountants(),
  ]);
  const apiBaseUrl = getApiBaseUrlForClient();
  return (
    <PropertiesPageClient
      properties={properties}
      apiBaseUrl={apiBaseUrl}
      managers={managers}
      accountants={accountants}
    />
  );
}
