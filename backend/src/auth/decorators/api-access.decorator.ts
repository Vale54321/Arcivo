import { applyDecorators } from '@nestjs/common';
import { ApiForbiddenResponse } from '@nestjs/swagger';

/** Documents endpoints that require an authenticated administrator. */
export function ApiAdminOnly() {
  return applyDecorators(
    ApiForbiddenResponse({ description: 'Administrator access is required' }),
  );
}

/** Documents endpoints accessible to administrators or the affected user. */
export function ApiAdminOrSelf() {
  return applyDecorators(
    ApiForbiddenResponse({
      description:
        'Administrator access or ownership of the user account is required',
    }),
  );
}
