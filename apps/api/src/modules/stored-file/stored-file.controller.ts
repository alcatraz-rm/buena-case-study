import { Controller, Get, Param, StreamableFile } from '@nestjs/common';
import { StoredFileService } from './stored-file.service';

@Controller('stored-files')
export class StoredFileController {
  constructor(private readonly storedFileService: StoredFileService) {}

  @Get(':id/meta')
  async meta(@Param('id') id: string): Promise<{
    id: string;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
  }> {
    const file = await this.storedFileService.findOne(id);

    return {
      id: file.id,
      originalName: file.originalName,
      mimeType: file.mimeType,
      sizeBytes: file.sizeBytes,
    };
  }

  @Get(':id')
  async download(@Param('id') id: string): Promise<StreamableFile> {
    const file = await this.storedFileService.findOne(id);

    return new StreamableFile(Buffer.from(file.content), {
      type: file.mimeType,
      disposition: `attachment; filename="${encodeURIComponent(file.originalName)}"`,
    });
  }
}
