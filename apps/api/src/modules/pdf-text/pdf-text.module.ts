import { Module } from '@nestjs/common';
import { PdfTextService } from './pdf-text.service';

@Module({
  providers: [PdfTextService],
  exports: [PdfTextService],
})
export class PdfTextModule {}

