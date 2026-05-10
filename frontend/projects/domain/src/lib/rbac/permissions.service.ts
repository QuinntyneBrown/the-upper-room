// traces_to: L2-023, L2-025
import { Injectable, signal } from '@angular/core';
import { Me } from 'api';
import { IPermissionsService } from './permissions.contract';
import { EMPTY_RBAC_SNAPSHOT, RbacSnapshot } from './rbac-snapshot';

@Injectable({ providedIn: 'root' })
export class PermissionsService implements IPermissionsService {
  readonly snapshot = signal<RbacSnapshot>(EMPTY_RBAC_SNAPSHOT);

  constructor() {
    if (typeof window !== 'undefined') {
      const seed = window.sessionStorage?.getItem('__e2e_rbac');
      if (seed) {
        try {
          this.snapshot.set(JSON.parse(seed) as RbacSnapshot);
        } catch {
          // ignore corrupt seed
        }
      }
      (window as unknown as { __setRbac: (s: RbacSnapshot) => void }).__setRbac = (s) => {
        this.snapshot.set(s);
        window.sessionStorage?.setItem('__e2e_rbac', JSON.stringify(s));
      };
    }
  }

  set(snapshot: RbacSnapshot): void {
    this.snapshot.set(snapshot);
  }

  setFromMe(me: Me): void {
    this.snapshot.set({
      userId: me.id,
      cityId: me.city,
      roles: me.roles,
      permissions: me.permissions,
    });
  }

  clear(): void {
    this.snapshot.set(EMPTY_RBAC_SNAPSHOT);
  }

  hasPermission(permission: string): boolean {
    return this.snapshot().permissions.includes(permission);
  }

  hasAnyRole(roles: readonly string[]): boolean {
    const owned = this.snapshot().roles;
    return roles.some((r) => owned.includes(r));
  }
}
