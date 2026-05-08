// traces_to: L2-023, L2-025
import { Injectable, signal } from '@angular/core';

export interface RbacSnapshot {
  readonly roles: readonly string[];
  readonly permissions: readonly string[];
}

const EMPTY: RbacSnapshot = { roles: [], permissions: [] };

@Injectable({ providedIn: 'root' })
export class PermissionsService {
  readonly snapshot = signal<RbacSnapshot>(EMPTY);

  constructor() {
    if (typeof window !== 'undefined') {
      (window as unknown as { __setRbac: (s: RbacSnapshot) => void }).__setRbac = (s) =>
        this.snapshot.set(s);
    }
  }

  set(snapshot: RbacSnapshot): void {
    this.snapshot.set(snapshot);
  }

  hasPermission(permission: string): boolean {
    return this.snapshot().permissions.includes(permission);
  }

  hasAnyRole(roles: readonly string[]): boolean {
    const owned = this.snapshot().roles;
    return roles.some((r) => owned.includes(r));
  }
}
