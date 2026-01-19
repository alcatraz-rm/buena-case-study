import { Injectable } from '@nestjs/common';
import pdf from 'pdf-parse';

@Injectable()
export class PdfTextService {
  async extractText(pdfBuffer: Buffer): Promise<string> {
    const data = await pdf(pdfBuffer);
    return (data.text ?? '').trim();
  }
}

