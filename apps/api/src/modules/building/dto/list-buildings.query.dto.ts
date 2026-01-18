import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { OptionalPositiveInt } from '~/lib/zod-utils';

export const TListBuildingsQuery = z.object({
  propertyId: OptionalPositiveInt,
});

export class ListBuildingsQueryDto extends createZodDto(TListBuildingsQuery) {}
