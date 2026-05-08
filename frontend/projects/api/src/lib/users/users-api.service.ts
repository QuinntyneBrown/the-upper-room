import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api-base-url.token';
import { Me } from '../models/me';
import { PagedList, UserListQuery } from '../models/paged-list';
import { UserRow } from '../models/user-row';
import { UserUpdate } from '../models/user-update';
import { IUsersApi } from './users-api.contract';

@Injectable({ providedIn: 'root' })
export class UsersApiService implements IUsersApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  getMe(): Observable<Me> {
    return this.http.get<Me>(`${this.baseUrl}/api/v1/users/me`);
  }

  list(query: UserListQuery): Observable<PagedList<UserRow>> {
    let params = new HttpParams();
    if (query.page !== undefined) params = params.set('page', String(query.page));
    if (query.pageSize !== undefined) params = params.set('pageSize', String(query.pageSize));
    if (query.search) params = params.set('search', query.search);
    if (query.role) params = params.set('role', query.role);
    return this.http.get<PagedList<UserRow>>(`${this.baseUrl}/api/v1/users`, { params });
  }

  update(id: string, patch: UserUpdate): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/api/v1/users/${id}`, patch);
  }

  disable(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/api/v1/users/${id}/disable`, {});
  }
}
