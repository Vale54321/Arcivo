import { Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface DocumentTable {
  id: Generated<string>;

  checksum: Buffer;

  name: string;
  extension: string;
  size: number;
  mimeType: string;

  ownerId: string;

  fileCreatedAt: Date;
  createdAt: Generated<Date>;

  hasThumbnail: Generated<boolean>;

  textContent: string | null;
}

export type DocumentEntity = Selectable<DocumentTable>;
export type NewDocument = Insertable<DocumentTable>;
export type DocumentUpdate = Updateable<DocumentTable>;

export interface Database {
  documents: DocumentTable;
}
