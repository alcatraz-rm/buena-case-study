import type { Selectable } from 'kysely';
import type { ManagerTable } from '../kysely/database';

export type Manager = Pick<Selectable<ManagerTable>, 'id' | 'name' | 'email'>;
