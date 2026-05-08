// traces_to: L2-015
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthProvider } from './auth-provider.contract';
import { PkceService } from './pkce.service';

@Injectable({ providedIn: 'root' })
export class PkceAuthProvider implements AuthProvider {
  private readonly pkce = inject(PkceService);

  signIn(): Observable<{ accessToken: string }> {
    // Browser navigates away during beginSignIn; the observable never resolves.
    return new Observable<{ accessToken: string }>(() => {
      this.pkce.beginSignIn();
    });
  }
}
