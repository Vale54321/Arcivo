export const QUEUES = {
    GOTENBERG_CONVERSION: 'gotenberg-conversion',
    THUMBNAIL_PROCESSING: 'thumbnail-processing',
};

export const JOB_TYPES = {
    CONVERT_TO_PDF: 'convert_to_pdf',
    GENERATE_THUMBNAIL: 'generate_thumbnail',
};

export const JOB_OPTS = {
    attempts: 3,
    backoff: { type: 'exponential' as const, delay: 1000 },
};