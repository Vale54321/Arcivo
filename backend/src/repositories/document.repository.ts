import { Inject, Injectable } from '@nestjs/common';
import { Kysely } from 'kysely';
import {
    Database,
    DocumentEntity,
    NewDocument,
    DocumentUpdate,
} from 'src/database/database.types';

export type CreateDocumentDto = Omit<NewDocument, 'checksum'> & { checksum: string };

@Injectable()
export class DocumentRepository {
    constructor(@Inject(Kysely) private readonly db: Kysely<Database>) { }
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

    async findAll() {
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
            .orderBy('fileCreatedAt', 'desc')
            .execute();
    }

    async update(id: string, data: DocumentUpdate) {
        return await this.db
            .updateTable('documents')
            .set(data as any)
            .where('id', '=', id)
            .returningAll()
            .executeTakeFirst();
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.db
            .deleteFrom('documents')
            .where('id', '=', id)
            .executeTakeFirst();
        return result.numDeletedRows > 0n;
    }
}