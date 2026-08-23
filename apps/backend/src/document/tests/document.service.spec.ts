import { BadRequestException } from '@nestjs/common';
import { DocumentEntity } from 'database/database.types';
import { JobService } from 'jobs/job.service';
import { LoggingService } from 'logging/logging.service';
import { StorageService } from 'storage/storage.service';
import { DocumentRepository } from '../document.repository';
import { DocumentService } from '../document.service';
import { FileHashService } from '../services/file-hash.service';

jest.mock('kysely', () => ({ Kysely: class Kysely {} }));
jest.mock('../utils/file-type', () => ({ getMimeType: jest.fn() }));

describe(DocumentService.name, () => {
  let service: DocumentService;
  let updateForOwner: jest.MockedFunction<DocumentRepository['updateForOwner']>;

  const document: DocumentEntity = {
    id: '11111111-1111-4111-8111-111111111111',
    checksum: Buffer.from('checksum'),
    name: 'invoice.pdf',
    extension: '.pdf',
    size: 1,
    mimeType: 'application/pdf',
    ownerId: '22222222-2222-4222-8222-222222222222',
    fileCreatedAt: new Date('2026-08-01T00:00:00.000Z'),
    createdAt: new Date('2026-08-02T00:00:00.000Z'),
    hasThumbnail: false,
    textContent: null,
  };

  beforeEach(() => {
    updateForOwner = jest.fn();
    const repository = {
      updateForOwner,
    } as unknown as DocumentRepository;
    const loggingService = {
      setContext: jest.fn(),
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    } as unknown as LoggingService;

    service = new DocumentService(
      repository,
      {} as JobService,
      {} as StorageService,
      loggingService,
      {} as FileHashService,
    );
  });

  it('updates all supplied editable metadata', async () => {
    updateForOwner.mockResolvedValue({
      ...document,
      name: 'renamed.pdf',
      fileCreatedAt: new Date('2026-08-03T00:00:00.000Z'),
    });

    await service.updateDocument(document.ownerId, document.id, {
      name: ' renamed.pdf ',
      fileCreatedAt: '2026-08-03T00:00:00.000Z',
    });

    expect(updateForOwner).toHaveBeenCalledWith(document.id, document.ownerId, {
      name: 'renamed.pdf',
      fileCreatedAt: new Date('2026-08-03T00:00:00.000Z'),
    });
  });

  it('rejects an empty metadata update', async () => {
    await expect(
      service.updateDocument(document.ownerId, document.id, {}),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(updateForOwner).not.toHaveBeenCalled();
  });
});
