import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PdfTextService } from './pdf-text.service';

@Module({
  providers: [PdfTextService, ConfigService],
  exports: [PdfTextService],
})
export class PdfTextModule {}
