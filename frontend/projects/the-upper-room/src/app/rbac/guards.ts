// traces_to: L2-024, L2-032
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { PERMISSIONS_SERVICE } from 'domain';
import { AccessTokenStore } from '../auth/access-token-store';
import { SnackbarService } from '../../../../components/src/lib/snackbar/tar-snackbar.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const tokens = inject(AccessTokenStore);
  const router = inject(Router);
  if (tokens.current()) return true;
  return router.createUrlTree(['/sign-in'], {
    queryParams: { returnUrl: state.url },
  });
};

export const roleGuard: CanActivateFn = (route) => {
  const perms = inject(PERMISSIONS_SERVICE);
  const router = inject(Router);
  const snackbar = inject(SnackbarService);
  const required = (route.data['roles'] ?? []) as string[];
  if (required.length === 0 || perms.hasAnyRole(required)) return true;
  snackbar.show("You don't have permission to view this page.", 'warning');
  return router.createUrlTree(['/forbidden']);
};

export const permissionGuard: CanActivateFn = (route) => {
  const perms = inject(PERMISSIONS_SERVICE);
  const router = inject(Router);
  const required = (route.data['permissions'] ?? []) as string[];
  if (required.length === 0 || required.every((p) => perms.hasPermission(p))) return true;
  return router.createUrlTree(['/forbidden']);
};
