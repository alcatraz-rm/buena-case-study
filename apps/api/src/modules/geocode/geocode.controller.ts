import { Controller, Get, Query } from '@nestjs/common';
import { GeocodeService } from './geocode.service';
import type { AddressSuggestion } from './types';
import { GeocodeAddressQueryDto } from './types';

@Controller('geocode')
export class GeocodeController {
  constructor(private readonly service: GeocodeService) {}

  @Get('addresses')
  async addresses(
    @Query() query: GeocodeAddressQueryDto,
  ): Promise<AddressSuggestion[]> {
    return await this.service.suggestAddresses({
      q: query.q,
      countryCode: query.countryCode,
    });
  }
}
