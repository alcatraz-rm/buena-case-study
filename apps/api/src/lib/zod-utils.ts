import { z } from 'zod';

export const OptionalPositiveInt = z
  .preprocess(
    (v) => (v === '' || v === undefined ? undefined : v),
    z.coerce.number().int().positive(),
  )
  .optional();
