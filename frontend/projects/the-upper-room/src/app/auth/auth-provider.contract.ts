// traces_to: L2-016
import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export interface AuthProvider {
  signIn(email: string, password: string): Observable<{ accessToken: string }>;
}

export const AUTH_PROVIDER = new InjectionToken<AuthProvider>('AUTH_PROVIDER');
