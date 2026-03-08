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
}