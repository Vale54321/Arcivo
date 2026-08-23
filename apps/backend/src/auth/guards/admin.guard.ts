import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthenticatedUser }>();

    if (!request.user?.isAdmin) {
      throw new ForbiddenException('Administrator access is required');
    }

    return true;
  }
}
