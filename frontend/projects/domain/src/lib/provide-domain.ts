import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { ME_BOOTSTRAP } from './bootstrap/me-bootstrap.contract';
import { MeBootstrap } from './bootstrap/me-bootstrap';
import { IDLE_SERVICE } from './auth/idle.service.contract';
import { IdleService } from './auth/idle.service';
import { SIGN_OUT_SERVICE } from './auth/sign-out.service.contract';
import { SignOutService } from './auth/sign-out.service';
import { CITY_SCOPE_SERVICE } from './cities/city-scope.service.contract';
import { CityScopeService } from './cities/city-scope.service';
import { PERMISSIONS_SERVICE } from './rbac/permissions.contract';
import { PermissionsService } from './rbac/permissions.service';
import { THEME_SERVICE } from './theme/theme.service.contract';
import { ThemeService } from './theme/theme.service';

export function provideDomain(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: PERMISSIONS_SERVICE, useExisting: PermissionsService },
    { provide: ME_BOOTSTRAP, useExisting: MeBootstrap },
    { provide: CITY_SCOPE_SERVICE, useExisting: CityScopeService },
    { provide: IDLE_SERVICE, useExisting: IdleService },
    { provide: SIGN_OUT_SERVICE, useExisting: SignOutService },
    { provide: THEME_SERVICE, useExisting: ThemeService },
    provideAppInitializer(() => {
      inject(ME_BOOTSTRAP).load();
    }),
  ]);
}
