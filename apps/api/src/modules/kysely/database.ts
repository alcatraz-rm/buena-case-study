import type { Generated, Selectable } from 'kysely';

export type ManagementType = 'WEG' | 'MV';

export type BuildingUnitType = 'Apartment' | 'Office' | 'Garden' | 'Parking';

export interface ManagerTable extends BaseTable {
  name: string;
  email: string;
}

export interface AccountantTable extends BaseTable {
  name: string;
  email: string;
}

export interface PropertyTable extends BaseTable {
  name: string;
  managementType: ManagementType;
  managerId: number;
  accountantId: number;

  // Teilungserklärung (declaration of division) upload metadata.
  declarationOfDivisionFileUrl: string | null;
  declarationOfDivisionFileName: string | null;
  declarationOfDivisionMimeType: string | null;
  declarationOfDivisionUploadedAt: Date | null;
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
  floor: string | null;
  entrance: string | null;
  sizeSqm: number | null;
  coOwnershipShare: string | null;
  constructionYear: number | null;
  rooms: number | null;
}

export type BuildingUnit = Selectable<BuildingUnitTable>;

export interface Database {
  manager: ManagerTable;
  accountant: AccountantTable;
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
