import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { OptionalPositiveInt } from '~/lib/zod-utils';

export const TListUnitsQuery = z.object({
  buildingId: OptionalPositiveInt,
});

export class ListUnitsQueryDto extends createZodDto(TListUnitsQuery) {}
