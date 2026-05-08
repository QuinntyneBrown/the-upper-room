// traces_to: L2-023, L2-025
import { InjectionToken, Signal } from '@angular/core';
import { Me } from 'api';
import { RbacSnapshot } from './rbac-snapshot';

export interface IPermissionsService {
  readonly snapshot: Signal<RbacSnapshot>;
  set(snapshot: RbacSnapshot): void;
  setFromMe(me: Me): void;
  clear(): void;
  hasPermission(permission: string): boolean;
  hasAnyRole(roles: readonly string[]): boolean;
}

export const PERMISSIONS_SERVICE = new InjectionToken<IPermissionsService>('PERMISSIONS_SERVICE');
