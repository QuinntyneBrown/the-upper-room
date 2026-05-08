import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { Me } from '../models/me';
import { PagedList, UserListQuery } from '../models/paged-list';
import { UserRow } from '../models/user-row';
import { UserUpdate } from '../models/user-update';

export interface IUsersApi {
  getMe(): Observable<Me>;
  list(query: UserListQuery): Observable<PagedList<UserRow>>;
  update(id: string, patch: UserUpdate): Observable<void>;
  disable(id: string): Observable<void>;
}

export const USERS_API = new InjectionToken<IUsersApi>('USERS_API');
