// traces_to: L2-015, L2-084
import { Injectable } from '@angular/core';
import { AccessTokenSource } from '../services/access-token.contract';

/**
 * In-memory access-token store. Set by the auth-callback after a successful
 * BFF exchange; read by the auth interceptor via ACCESS_TOKEN_SOURCE.
 *
 * window.__setTestToken stays for e2e specs that want to fake an authenticated
 * session without standing up the full PKCE flow.
 */
@Injectable({ providedIn: 'root' })
export class AccessTokenStore implements AccessTokenSource {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const seed = window.sessionStorage?.getItem('__e2e_access_token');
      if (seed) this.token = seed;
      (window as unknown as { __setTestToken: (t: string | null) => void }).__setTestToken = (
        t,
      ) => {
        this.set(t);
        if (t === null) window.sessionStorage?.removeItem('__e2e_access_token');
        else window.sessionStorage?.setItem('__e2e_access_token', t);
      };
    }
  }

  current(): string | null {
    return this.token;
  }

  set(token: string | null): void {
    this.token = token;
  }
}
