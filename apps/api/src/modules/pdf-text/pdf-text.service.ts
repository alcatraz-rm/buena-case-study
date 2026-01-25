import {
  DeclarationOfDivisionExtraction,
  DeclarationOfDivisionExtractionSchema,
} from '@buena/types';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import pdf from 'pdf-parse';
import { z } from 'zod';
import { buildOpenAiEntityExtractionPrompt } from './openai-extract.prompt';

const TOpenAiChatCompletion = z.object({
  choices: z
    .array(
      z.object({
        message: z.object({ content: z.string() }),
      }),
    )
    .min(1),
});

const MAX_CHARS = 20_000;

const OPEN_API_URL = 'https://api.openai.com/v1/chat/completions';

@Injectable()
export class PdfTextService {
  private readonly openAiApiKey: string;
  private readonly openAiModel = 'gpt-4o-mini';

  private readonly serviceEnabled: boolean;

  constructor(private readonly configService: ConfigService) {
    this.openAiApiKey = this.configService.get<string>('OPEN_AI_API_KEY') ?? '';
    this.serviceEnabled = this.openAiApiKey.length > 0;
  }

  async extractText(pdfBuffer: Buffer): Promise<string> {
    const data = await pdf(pdfBuffer);
    return (data.text ?? '').trim();
  }

  async extractEntitiesFromPdfWithOpenAi(
    pdfBuffer: Buffer,
  ): Promise<DeclarationOfDivisionExtraction> {
    const text = await this.extractText(pdfBuffer);
    return await this.extractEntitiesFromTextWithOpenAi(text);
  }

  async extractEntitiesFromTextWithOpenAi(
    text: string,
  ): Promise<DeclarationOfDivisionExtraction> {
    if (!this.serviceEnabled) {
      throw new BadRequestException('OpenAI service is not enabled');
    }

    const inputText = text.length > MAX_CHARS ? text.slice(0, MAX_CHARS) : text;

    const prompt = buildOpenAiEntityExtractionPrompt(inputText);

    const response = await fetch(OPEN_API_URL, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${this.openAiApiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: this.openAiModel,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'Return strictly valid JSON matching the requested shape. No markdown.',
          },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      throw new InternalServerErrorException(
        `OpenAI request failed with status ${response.status}`,
      );
    }

    const rawJson = (await response.json()) as unknown;
    const openAiParsed = TOpenAiChatCompletion.safeParse(rawJson);
    if (!openAiParsed.success) {
      throw new InternalServerErrorException('Failed to parse OpenAI response');
    }

    const content = openAiParsed.data.choices[0]?.message.content;

    try {
      const parsed = JSON.parse(content) as unknown;
      const result = DeclarationOfDivisionExtractionSchema.safeParse(parsed);

      if (!result.success) {
        throw new InternalServerErrorException(
          'Failed to parse OpenAI response',
        );
      }
      return result.data;
    } catch {
      throw new InternalServerErrorException('Failed to parse OpenAI response');
    }
  }
}
