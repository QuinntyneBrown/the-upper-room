// traces_to: L2-024, L2-032
import { TestBed, fakeAsync } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, provideRouter } from '@angular/router';
import { authGuard, roleGuard, permissionGuard } from './guards';
import { ACCESS_TOKEN_SOURCE } from '../auth/access-token-source.contract';
import { PERMISSIONS_SERVICE, IPermissionsService } from './permissions.contract';
import { signal } from '@angular/core';
import { SnackbarService } from 'components';

function mockPerms(roles: string[] = [], perms: string[] = []): IPermissionsService {
  return {
    snapshot: signal({ roles, permissions: perms }),
    set: () => {},
    setFromMe: () => {},
    clear: () => {},
    hasPermission: (p: string) => perms.includes(p),
    hasAnyRole: (r: readonly string[]) => r.some((role) => roles.includes(role)),
  } as unknown as IPermissionsService;
}

function routeWith(data: Record<string, unknown>): ActivatedRouteSnapshot {
  return { data } as unknown as ActivatedRouteSnapshot;
}

const state = {} as RouterStateSnapshot;

describe('authGuard (domain library)', () => {
  function setup(hasToken: boolean) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: ACCESS_TOKEN_SOURCE, useValue: { current: () => hasToken ? 'tok' : null } },
      ],
    });
  }

  it('returns true when token present', fakeAsync(() => {
    setup(true);
    const result = TestBed.runInInjectionContext(() => authGuard(routeWith({}), state));
    expect(result).toBe(true);
  }));

  it('redirects to /sign-in when no token', fakeAsync(() => {
    setup(false);
    const result = TestBed.runInInjectionContext(() => authGuard(routeWith({}), state));
    expect(result).not.toBe(true);
  }));
});

describe('roleGuard (domain library)', () => {
  function setup(roles: string[]) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: PERMISSIONS_SERVICE, useValue: mockPerms(roles) },
        { provide: SnackbarService, useValue: { show: () => {} } },
      ],
    });
  }

  it('returns true when user has required role', fakeAsync(() => {
    setup(['Admin']);
    const result = TestBed.runInInjectionContext(() =>
      roleGuard(routeWith({ roles: ['Admin'] }), state),
    );
    expect(result).toBe(true);
  }));

  it('redirects to /forbidden when role missing', fakeAsync(() => {
    setup(['Member']);
    const result = TestBed.runInInjectionContext(() =>
      roleGuard(routeWith({ roles: ['Admin'] }), state),
    );
    expect(result).not.toBe(true);
  }));
});

describe('permissionGuard (domain library)', () => {
  function setup(perms: string[]) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: PERMISSIONS_SERVICE, useValue: mockPerms([], perms) },
      ],
    });
  }

  it('returns true when user has required permission', fakeAsync(() => {
    setup(['Contact:Read']);
    const result = TestBed.runInInjectionContext(() =>
      permissionGuard(routeWith({ permissions: ['Contact:Read'] }), state),
    );
    expect(result).toBe(true);
  }));

  it('redirects to /forbidden when permission missing', fakeAsync(() => {
    setup([]);
    const result = TestBed.runInInjectionContext(() =>
      permissionGuard(routeWith({ permissions: ['Contact:Delete'] }), state),
    );
    expect(result).not.toBe(true);
  }));
});
