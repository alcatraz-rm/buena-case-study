import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type FeatureFlags = {
  openAiEnabled: boolean;
};

@Controller('feature-flags')
export class FeatureFlagsController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  getFlags(): FeatureFlags {
    const key = (
      this.configService.get<string>('OPEN_AI_API_KEY') ?? ''
    ).trim();

    return { openAiEnabled: key.length > 0 };
  }
}
