// traces_to: L2-015, L2-016
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { SKIP_ERROR_SNACKBAR } from 'api';
import { AuthProvider } from './auth-provider.contract';
import { PkceService } from './pkce.service';

@Injectable({ providedIn: 'root' })
export class PkceAuthProvider implements AuthProvider {
  private readonly http = inject(HttpClient);
  private readonly pkce = inject(PkceService);

  /**
   * Validates the credentials against the API first so invalid ones surface on
   * the form (L2-016), then hands off to the PKCE redirect (L2-015). The
   * browser navigates away during beginSignIn, so the observable never resolves
   * on success.
   */
  signIn(email: string, password: string): Observable<{ accessToken: string }> {
    return this.http
      .post<{ accessToken: string }>(
        '/api/v1/auth/sign-in',
        { email, password },
        { context: new HttpContext().set(SKIP_ERROR_SNACKBAR, true) },
      )
      .pipe(
        catchError((err: unknown) => {
          const code =
            err instanceof HttpErrorResponse ? (err.error as { code?: string } | null)?.code : undefined;
          return throwError(() => ({ code }));
        }),
        switchMap(
          () =>
            new Observable<{ accessToken: string }>(() => {
              void this.pkce.beginSignIn();
            }),
        ),
      );
  }
}
