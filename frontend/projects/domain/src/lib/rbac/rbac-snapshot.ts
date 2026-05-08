export interface RbacSnapshot {
  readonly roles: readonly string[];
  readonly permissions: readonly string[];
  readonly userId?: string;
  readonly cityId?: string;
}

export const EMPTY_RBAC_SNAPSHOT: RbacSnapshot = { roles: [], permissions: [] };
