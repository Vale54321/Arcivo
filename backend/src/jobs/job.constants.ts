export const QUEUES = {
  GOTENBERG_CONVERSION: 'gotenberg-conversion',
};

export const JOB_TYPES = {
  CONVERT_TO_PDF: 'convert_to_pdf',
};

export const JOB_OPTS = {
    attempts: 3,
    backoff: { type: 'exponential' as const, delay: 1000 },
};