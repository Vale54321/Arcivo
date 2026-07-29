import { basename } from 'node:path';

/**
 * Decodes the URL-encoded `x-arcivo-filename` header into a plain UTF-8 name.
 *
 * The multipart `filename` reported by busboy is decoded as latin1, which turns
 * UTF-8 names into mojibake ("Ärzte" -> "%C3%A4rzte"),
 * so the header is the authoritative source for the original name.
 *
 * Returns null when the header is missing, malformed, or not a usable file name.
 */
export const decodeUploadFilename = (raw?: string): string | null => {
  if (!raw) return null;

  let decoded: string;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return null;
  }

  const name = basename(decoded.replace(/\\/g, '/')).trim();
  if (!name || name === '.' || name === '..') return null;

  return name;
};

const RFC5987_RESERVED = /[!'()*]/g;

/**
 * Builds a Content-Disposition value that survives non-ASCII names.
 *
 * HTTP header values are latin1, so the plain `filename` parameter is limited to
 * ASCII and the real name is carried by the RFC 5987 `filename*` parameter.
 */
export const contentDisposition = (
  filename: string,
  type: 'inline' | 'attachment' = 'inline',
): string => {
  const ascii = filename.replace(/[^\x20-\x7e]/g, '_').replace(/["\\]/g, '_');
  const encoded = encodeURIComponent(filename).replace(
    RFC5987_RESERVED,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );

  return `${type}; filename="${ascii}"; filename*=UTF-8''${encoded}`;
};
