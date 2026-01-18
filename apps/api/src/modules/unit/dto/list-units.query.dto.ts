import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// todo check if there is better way to do this
const OptionalPositiveInt = z
  .preprocess(
    (v) => (v === '' || v === undefined ? undefined : v),
    z.coerce.number().int().positive(),
  )
  .optional();

export const TListUnitsQuery = z.object({
  buildingId: OptionalPositiveInt,
});

export class ListUnitsQueryDto extends createZodDto(TListUnitsQuery) {}
