import type { Generated, Selectable } from 'kysely';

export type ManagementType = 'WEG' | 'MV';

export type BuildingUnitType = 'Apartment' | 'Office' | 'Garden' | 'Parking';

export interface ManagerTable extends BaseTable {
  name: string;
  email: string;
}

export type Manager = Selectable<ManagerTable>;

export interface AccountantTable extends BaseTable {
  name: string;
  email: string;
}

export type Accountant = Selectable<AccountantTable>;

export interface PropertyTable extends BaseTable {
  name: string;
  managementType: ManagementType;
  managerId: number;
  accountantId: number;

  // Teilungserklärung file id
  declarationOfDivisionFileId: string | null;
}

export type Property = Selectable<PropertyTable>;

export interface BuildingTable extends BaseTable {
  name: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  propertyId: number;
  country: string;
}

export type Building = Selectable<BuildingTable>;

export interface BuildingUnitTable extends BaseTable {
  buildingId: number;
  unitType: BuildingUnitType;
  number: string;
  description: string | null;
  floor: string | null;
  entrance: string | null;
  sizeSqm: number | null;
  coOwnershipShare: string | null;
  constructionYear: number | null;
  rooms: number | null;
}

export type BuildingUnit = Selectable<BuildingUnitTable>;

export interface StoredFileTable {
  id: Generated<string>;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
  deletedAt: Generated<Date | null>;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  content: Uint8Array;
}

export type StoredFile = Selectable<StoredFileTable>;

export interface Database {
  manager: ManagerTable;
  accountant: AccountantTable;
  storedFile: StoredFileTable;
  property: PropertyTable;
  building: BuildingTable;
  buildingUnit: BuildingUnitTable;
}

interface BaseTable {
  id: Generated<number>;
  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
  deletedAt: Generated<Date | null>;
}
