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

export interface UserTable {
  id: Generated<string>;

  email: string;
  displayName: string;
  isAdmin: Generated<boolean>;
  passwordHash: string | null;

  createdAt: Generated<Date>;
  updatedAt: Generated<Date>;
}

export type UserEntity = Omit<Selectable<UserTable>, 'passwordHash'>;
export type UserCredentialsEntity = Pick<
  Selectable<UserTable>,
  'id' | 'email' | 'displayName' | 'isAdmin' | 'passwordHash'
>;
export type NewUser = Insertable<UserTable>;
export type UserUpdate = Updateable<UserTable>;

export interface Database {
  documents: DocumentTable;
  users: UserTable;
}
