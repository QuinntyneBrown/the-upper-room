// traces_to: L2-016
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AuthProvider } from './auth-provider.contract';

const VALID_EMAIL = 'test@example.com';
const VALID_PASSWORD = 'Password!23456';

@Injectable({ providedIn: 'root' })
export class MockAuthProvider implements AuthProvider {
  signIn(email: string, password: string): Observable<{ accessToken: string }> {
    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
      return of({ accessToken: 'mock-access-token' }).pipe(delay(50));
    }
    return throwError(() => ({ code: 'auth.invalid_credentials' })).pipe(delay(50));
  }
}
