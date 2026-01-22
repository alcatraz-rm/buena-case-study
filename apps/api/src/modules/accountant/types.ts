import { Selectable } from 'kysely';
import type { AccountantTable } from '../kysely/database';

export type Accountant = Pick<
  Selectable<AccountantTable>,
  'id' | 'name' | 'email'
>;
