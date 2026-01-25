import type { PersonOption, PropertyListItem } from '@buena/types';
import { PropertiesPageClient } from './components/PropertiesPageClient';
import {
  getApiBaseUrlForClient,
  getApiBaseUrlForServer,
} from './lib/api-base-url';

async function getProperties(): Promise<PropertyListItem[]> {
  const baseUrl = getApiBaseUrlForServer();
  const response = await fetch(`${baseUrl}/properties`, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Failed to load properties (${response.status})`);
  }

  return (await response.json()) as PropertyListItem[];
}

async function getManagers(): Promise<PersonOption[]> {
  const baseUrl = getApiBaseUrlForServer();
  const response = await fetch(`${baseUrl}/managers`, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Failed to load managers (${response.status})`);
  }

  return (await response.json()) as PersonOption[];
}

async function getAccountants(): Promise<PersonOption[]> {
  const baseUrl = getApiBaseUrlForServer();
  const response = await fetch(`${baseUrl}/accountants`, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`Failed to load accountants (${response.status})`);
  }

  return (await response.json()) as PersonOption[];
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
