import { Inject, Injectable } from '@nestjs/common';
import { Kysely } from 'kysely';
import {
  Database,
  DocumentEntity,
  NewDocument,
  DocumentUpdate,
} from 'database/database.types';

export type CreateDocumentDto = Omit<NewDocument, 'checksum'> & {
  checksum: string;
};

@Injectable()
export class DocumentRepository {
  constructor(@Inject(Kysely) private readonly db: Kysely<Database>) {}
  async create(data: CreateDocumentDto): Promise<DocumentEntity> {
    return await this.db
      .insertInto('documents')
      .values({
        ...data,
        checksum: Buffer.from(data.checksum, 'hex'),
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async findById(id: string) {
    return await this.db
      .selectFrom('documents')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  async findByIdForOwner(id: string, ownerId: string) {
    return await this.db
      .selectFrom('documents')
      .selectAll()
      .where('id', '=', id)
      .where('ownerId', '=', ownerId)
      .executeTakeFirst();
  }

  async findByChecksum(
    ownerId: string,
    checksum: string,
  ): Promise<Pick<DocumentEntity, 'id'> | null> {
    const checksumBuffer = Buffer.from(checksum, 'hex');

    const result = await this.db
      .selectFrom('documents')
      .select(['id'])
      .where('ownerId', '=', ownerId)
      .where('checksum', '=', checksumBuffer)
      .executeTakeFirst();

    return result ?? null;
  }

  async findAll(ownerId: string) {
    return await this.db
      .selectFrom('documents')
      .select([
        'id',
        'name',
        'size',
        'mimeType',
        'fileCreatedAt',
        'createdAt',
        'hasThumbnail',
      ])
      .where('ownerId', '=', ownerId)
      .orderBy('fileCreatedAt', 'desc')
      .execute();
  }

  async update(id: string, data: DocumentUpdate) {
    return await this.db
      .updateTable('documents')
      .set(data)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  async updateForOwner(id: string, ownerId: string, data: DocumentUpdate) {
    return await this.db
      .updateTable('documents')
      .set(data)
      .where('id', '=', id)
      .where('ownerId', '=', ownerId)
      .returningAll()
      .executeTakeFirst();
  }

  async search(ownerId: string, query: string) {
    const term = `%${query}%`;
    return await this.db
      .selectFrom('documents')
      .select([
        'id',
        'name',
        'size',
        'mimeType',
        'fileCreatedAt',
        'createdAt',
        'hasThumbnail',
        'textContent',
      ])
      .where((eb) =>
        eb.or([eb('name', 'ilike', term), eb('textContent', 'ilike', term)]),
      )
      .where('ownerId', '=', ownerId)
      .orderBy('fileCreatedAt', 'desc')
      .execute();
  }

  async deleteForOwner(id: string, ownerId: string): Promise<boolean> {
    const result = await this.db
      .deleteFrom('documents')
      .where('id', '=', id)
      .where('ownerId', '=', ownerId)
      .executeTakeFirst();
    return result.numDeletedRows > 0n;
  }
}
