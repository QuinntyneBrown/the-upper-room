// traces_to: L2-015
import { Injectable, inject } from '@angular/core';
import { IDP_CONFIG } from './idp-config';

const STORAGE_VERIFIER = 'pkce.verifier';
const STORAGE_STATE = 'pkce.state';
const STORAGE_NONCE = 'pkce.nonce';

@Injectable({ providedIn: 'root' })
export class PkceService {
  private readonly idp = inject(IDP_CONFIG);

  /** Generates and stores the PKCE verifier/state/nonce; returns the values the IdP needs. */
  async prepare(): Promise<{ codeChallenge: string; state: string }> {
    const verifier = this.randomString(64);
    const state = this.randomString(32);
    const nonce = this.randomString(32);
    const codeChallenge = await this.sha256Base64Url(verifier);

    sessionStorage.setItem(STORAGE_VERIFIER, verifier);
    sessionStorage.setItem(STORAGE_STATE, state);
    sessionStorage.setItem(STORAGE_NONCE, nonce);
    return { codeChallenge, state };
  }

  /** Sends the browser to the app's callback route carrying the authorization code. */
  completeSignIn(code: string, state: string): void {
    const url = new URL(this.idp.redirectUri);
    url.searchParams.set('code', code);
    url.searchParams.set('state', state);
    window.location.assign(url.toString());
  }

  consumeState(): { verifier: string | null; state: string | null } {
    const verifier = sessionStorage.getItem(STORAGE_VERIFIER);
    const state = sessionStorage.getItem(STORAGE_STATE);
    sessionStorage.removeItem(STORAGE_VERIFIER);
    sessionStorage.removeItem(STORAGE_STATE);
    sessionStorage.removeItem(STORAGE_NONCE);
    return { verifier, state };
  }

  private randomString(length: number): string {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return this.base64Url(bytes);
  }

  private async sha256Base64Url(input: string): Promise<string> {
    const data = new TextEncoder().encode(input);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return this.base64Url(new Uint8Array(hash));
  }

  private base64Url(bytes: Uint8Array): string {
    let s = '';
    for (const b of bytes) s += String.fromCharCode(b);
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
}
