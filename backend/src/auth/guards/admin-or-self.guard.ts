import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

@Injectable()
export class AdminOrSelfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request<{ id: string }> & { user?: AuthenticatedUser }>();
    const currentUser = request.user;

    if (!currentUser?.isAdmin && currentUser?.id !== request.params.id) {
      throw new ForbiddenException(
        'Administrator access or ownership of the user account is required',
      );
    }

    return true;
  }
}
