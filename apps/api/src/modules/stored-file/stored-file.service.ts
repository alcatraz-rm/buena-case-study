import { Injectable, NotFoundException } from '@nestjs/common';
import { StoredFile } from '../kysely/database';
import { KyselyService } from '../kysely/kysely.service';

@Injectable()
export class StoredFileService {
  constructor(private readonly kysely: KyselyService) {}

  async create(input: {
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    content: Uint8Array;
  }): Promise<StoredFile> {
    return await this.kysely.db
      .insertInto('storedFile')
      .values({
        originalName: input.originalName,
        mimeType: input.mimeType,
        sizeBytes: input.sizeBytes,
        content: input.content,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async findOne(id: string): Promise<StoredFile> {
    const file = await this.kysely.db
      .selectFrom('storedFile')
      .selectAll()
      .where('storedFile.id', '=', id)
      .where('storedFile.deletedAt', 'is', null)
      .executeTakeFirst();

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file;
  }

  async remove(id: string): Promise<void> {
    const result = await this.kysely.db
      .updateTable('storedFile')
      .set({ deletedAt: new Date() })
      .where('storedFile.id', '=', id)
      .where('storedFile.deletedAt', 'is', null)
      .returning(['storedFile.id'])
      .executeTakeFirst();

    if (!result) {
      throw new NotFoundException('File not found');
    }
  }
}
