export interface PagedList<T> {
  readonly items: readonly T[];
  readonly total: number;
}

export interface UserListQuery {
  readonly page?: number;
  readonly pageSize?: number;
  readonly search?: string;
  readonly role?: string;
}
