import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { ME_BOOTSTRAP } from './bootstrap/me-bootstrap.contract';
import { MeBootstrap } from './bootstrap/me-bootstrap';
import { PERMISSIONS_SERVICE } from './rbac/permissions.contract';
import { PermissionsService } from './rbac/permissions.service';

export function provideDomain(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: PERMISSIONS_SERVICE, useExisting: PermissionsService },
    { provide: ME_BOOTSTRAP, useExisting: MeBootstrap },
    provideAppInitializer(() => {
      inject(ME_BOOTSTRAP).load();
    }),
  ]);
}
