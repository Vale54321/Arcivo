const test = require('node:test');
const assert = require('node:assert/strict');
const contracts = require('../dist');

const id = '11111111-1111-4111-8111-111111111111';

test('request contracts accept valid values and reject invalid values', () => {
  assert.equal(
    contracts.createUserRequestSchema.safeParse({
      email: 'ada@example.com',
      displayName: 'Ada',
      password: 'correct horse battery staple',
    }).success,
    true,
  );
  assert.equal(
    contracts.createUserRequestSchema.safeParse({
      email: 'invalid',
      displayName: ' ',
      password: 'short',
    }).success,
    false,
  );
  assert.equal(contracts.updateUserRequestSchema.safeParse({}).success, false);
  assert.deepEqual(contracts.documentSearchQuerySchema.parse({ q: ' invoice ' }), {
    q: 'invoice',
  });
});

test('response contracts distinguish nullable and optional fields', () => {
  const response = {
    id,
    name: 'invoice.pdf',
    size: 42,
    mimeType: 'application/pdf',
    fileCreatedAt: '2026-08-01T00:00:00.000Z',
    createdAt: '2026-08-02T00:00:00.000Z',
    hasThumbnail: false,
    checksum: { type: 'Buffer', data: [0, 255] },
    extension: '.pdf',
    ownerId: id,
    textContent: null,
  };
  assert.deepEqual(contracts.documentResponseSchema.parse(response), response);
  assert.equal(
    contracts.documentResponseSchema.safeParse({ ...response, textContent: undefined }).success,
    false,
  );
});

test('enum and event contracts reject unknown literals', () => {
  assert.equal(contracts.documentUploadStatusSchema.safeParse('duplicate').success, true);
  assert.equal(contracts.documentUploadStatusSchema.safeParse('pending').success, false);
  assert.equal(
    contracts.appEventSchema.safeParse({
      id,
      type: contracts.APP_EVENTS.DOCUMENT_THUMBNAIL_GENERATED,
      occurredAt: '2026-08-02T00:00:00.000Z',
      data: { documentId: id },
    }).success,
    true,
  );
});
