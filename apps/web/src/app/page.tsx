import type { PersonOption, PropertyListItem } from '@buena/shared';
import { PropertiesPageClient } from './components/PropertiesPageClient';

async function getProperties(): Promise<PropertyListItem[]> {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';
  const res = await fetch(`${baseUrl}/properties`, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error(`Failed to load properties (${res.status})`);
  }

  return (await res.json()) as PropertyListItem[];
}

async function getManagers(): Promise<PersonOption[]> {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';
  const res = await fetch(`${baseUrl}/managers`, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error(`Failed to load managers (${res.status})`);
  }

  return (await res.json()) as PersonOption[];
}

async function getAccountants(): Promise<PersonOption[]> {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';
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
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';
  return (
    <PropertiesPageClient
      properties={properties}
      apiBaseUrl={apiBaseUrl}
      managers={managers}
      accountants={accountants}
    />
  );
}
