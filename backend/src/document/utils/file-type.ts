import mime from 'mime';

const MIME_TYPES = {
  office: [
    // Word
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.oasis.opendocument.text',
    // Excel
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.oasis.opendocument.spreadsheet',
    // PowerPoint
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.oasis.opendocument.presentation',
  ],
  pdf: ['application/pdf'],
  text: ['text/plain', 'text/markdown', 'text/csv'],
};

const ALL_SUPPORTED_TYPES = Object.values(MIME_TYPES).flat();

export const getMimeType = (filename: string): string => {
  return mime.getType(filename) ?? 'application/octet-stream';
};

export const isOfficeMimeType = (mimeType: string): boolean =>
  MIME_TYPES.office.includes(mimeType);
export const isPdfMimeType = (mimeType: string): boolean =>
  MIME_TYPES.pdf.includes(mimeType);
export const isTextMimeType = (mimeType: string): boolean =>
  MIME_TYPES.text.includes(mimeType);

export const isSupportedMimeType = (mimeType: string): boolean =>
  ALL_SUPPORTED_TYPES.includes(mimeType);
