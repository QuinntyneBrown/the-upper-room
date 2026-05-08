import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { ExchangeRequest, ExchangeResponse } from '../models/exchange';

export interface IAuthApi {
  exchange(request: ExchangeRequest): Observable<ExchangeResponse>;
}

export const AUTH_API = new InjectionToken<IAuthApi>('AUTH_API');
