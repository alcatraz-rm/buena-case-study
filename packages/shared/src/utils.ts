import { z } from 'zod';

export const OptionalPositiveInt = z.preprocess((v) => {
  if (v === undefined || v === null || v === '') return undefined;
  if (typeof v === 'number') return v;
  if (typeof v === 'string') return Number(v);
  return v;
}, z.number().int().positive().optional());

