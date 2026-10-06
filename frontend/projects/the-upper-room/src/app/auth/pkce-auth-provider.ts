// traces_to: L2-015, L2-016
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpErrorResponse } from '@angular/common/http';
import { Observable, NEVER, catchError, from, switchMap, tap, throwError } from 'rxjs';
import { SKIP_ERROR_SNACKBAR } from 'api';
import { AuthProvider } from './auth-provider.contract';
import { IDP_CONFIG } from './idp-config';
import { PkceService } from './pkce.service';

@Injectable({ providedIn: 'root' })
export class PkceAuthProvider implements AuthProvider {
  private readonly http = inject(HttpClient);
  private readonly pkce = inject(PkceService);
  private readonly idp = inject(IDP_CONFIG);

  /**
   * Posts the credentials and the PKCE challenge to the IdP (L2-015). Invalid
   * credentials surface on the form (L2-016); on success the browser is sent to
   * the callback route, so the observable never resolves.
   */
  signIn(email: string, password: string): Observable<{ accessToken: string }> {
    return from(this.pkce.prepare()).pipe(
      switchMap(({ codeChallenge, state }) =>
        this.http
          .post<{ code: string }>(
            this.idp.authorizeUrl,
            { email, password, codeChallenge },
            { context: new HttpContext().set(SKIP_ERROR_SNACKBAR, true) },
          )
          .pipe(tap(({ code }) => this.pkce.completeSignIn(code, state))),
      ),
      catchError((err: unknown) => {
        const code =
          err instanceof HttpErrorResponse ? (err.error as { code?: string } | null)?.code : undefined;
        return throwError(() => ({ code }));
      }),
      switchMap(() => NEVER),
    );
  }
}
