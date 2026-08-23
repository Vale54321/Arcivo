import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AdminOrSelfGuard } from '../guards/admin-or-self.guard';

describe(AdminOrSelfGuard.name, () => {
  const guard = new AdminOrSelfGuard();

  function contextFor(
    user: { id: string; isAdmin: boolean } | undefined,
    id: string,
  ): ExecutionContext {
    return {
      switchToHttp: () => ({ getRequest: () => ({ user, params: { id } }) }),
    } as ExecutionContext;
  }

  it('allows administrators to access every user account', () => {
    expect(guard.canActivate(contextFor({ id: 'admin-id', isAdmin: true }, 'user-id'))).toBe(true);
  });

  it('allows users to access their own account', () => {
    expect(guard.canActivate(contextFor({ id: 'user-id', isAdmin: false }, 'user-id'))).toBe(true);
  });

  it('rejects users accessing another account', () => {
    expect(() =>
      guard.canActivate(contextFor({ id: 'user-id', isAdmin: false }, 'another-user-id')),
    ).toThrow(ForbiddenException);
  });
});
