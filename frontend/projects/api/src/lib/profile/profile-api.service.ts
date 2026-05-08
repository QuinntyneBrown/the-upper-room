import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api-base-url.token';
import { Profile } from '../models/profile';
import { IProfileApi } from './profile-api.contract';

@Injectable({ providedIn: 'root' })
export class ProfileApiService implements IProfileApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  get(): Observable<Profile> {
    return this.http.get<Profile>(`${this.baseUrl}/api/v1/users/me/profile`);
  }

  update(profile: Profile): Observable<Profile> {
    return this.http.patch<Profile>(`${this.baseUrl}/api/v1/users/me/profile`, profile);
  }
}
