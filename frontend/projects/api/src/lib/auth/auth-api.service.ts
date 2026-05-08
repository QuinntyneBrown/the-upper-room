import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api-base-url.token';
import { ExchangeRequest, ExchangeResponse } from '../models/exchange';
import { IAuthApi } from './auth-api.contract';

@Injectable({ providedIn: 'root' })
export class AuthApiService implements IAuthApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  exchange(request: ExchangeRequest): Observable<ExchangeResponse> {
    return this.http.post<ExchangeResponse>(`${this.baseUrl}/api/v1/auth/exchange`, request);
  }
}
