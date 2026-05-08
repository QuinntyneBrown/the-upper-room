export interface Me {
  readonly id: string;
  readonly email: string;
  readonly city: string;
  readonly roles: readonly string[];
  readonly permissions: readonly string[];
}
