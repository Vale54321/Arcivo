import { Inject, Injectable } from '@nestjs/common';
import { Kysely } from 'kysely';
import {
    Database,
    DocumentEntity,
    NewDocument,
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
}