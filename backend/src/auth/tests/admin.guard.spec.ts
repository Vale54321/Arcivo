import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AdminGuard } from '../guards/admin.guard';

describe(AdminGuard.name, () => {
  const guard = new AdminGuard();

  function contextFor(isAdmin?: boolean): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => (isAdmin === undefined ? {} : { user: { isAdmin } }),
      }),
    } as ExecutionContext;
  }

  it('allows administrators', () => {
    expect(guard.canActivate(contextFor(true))).toBe(true);
  });

  it.each([false, undefined])('rejects non-administrators', (isAdmin) => {
    expect(() => guard.canActivate(contextFor(isAdmin))).toThrow(
      ForbiddenException,
    );
  });
});
