import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiForbiddenResponse } from '@nestjs/swagger';
import { AdminGuard } from '../guards/admin.guard';
import { AdminOrSelfGuard } from '../guards/admin-or-self.guard';

export function ApiAdminOnly() {
  return applyDecorators(
    ApiForbiddenResponse({ description: 'Administrator access is required' }),
    UseGuards(AdminGuard),
  );
}

export function ApiAdminOrSelf() {
  return applyDecorators(
    ApiForbiddenResponse({
      description:
        'Administrator access or ownership of the user account is required',
    }),
    UseGuards(AdminOrSelfGuard),
  );
}
