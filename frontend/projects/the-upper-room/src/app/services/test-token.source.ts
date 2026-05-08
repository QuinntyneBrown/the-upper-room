// traces_to: L2-084, L2-115
import { Injectable } from '@angular/core';
import { AccessTokenSource } from './access-token.contract';

/**
 * In-memory access-token holder. The real token-aware source ships in TASK-0021.
 * Exposes a window.__setTestToken hook so e2e specs can simulate "authenticated"
 * without standing up the full auth flow.
 */
@Injectable({ providedIn: 'root' })
export class TestTokenSource implements AccessTokenSource {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      (window as unknown as { __setTestToken: (t: string | null) => void }).__setTestToken = (
        t,
      ) => {
        this.token = t;
      };
    }
  }

  current(): string | null {
    return this.token;
  }
}
