import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// todo check if there is better way to do this
const OptionalPositiveInt = z
  .preprocess(
    (v) => (v === '' || v === undefined ? undefined : v),
    z.coerce.number().int().positive(),
  )
  .optional();

export const TListBuildingsQuery = z.object({
  propertyId: OptionalPositiveInt,
});

export class ListBuildingsQueryDto extends createZodDto(TListBuildingsQuery) {}
