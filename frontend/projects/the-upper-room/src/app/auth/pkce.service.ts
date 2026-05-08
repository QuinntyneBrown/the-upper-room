// traces_to: L2-015
import { Injectable, inject } from '@angular/core';
import { IDP_CONFIG } from './idp-config';

const STORAGE_VERIFIER = 'pkce.verifier';
const STORAGE_STATE = 'pkce.state';
const STORAGE_NONCE = 'pkce.nonce';

@Injectable({ providedIn: 'root' })
export class PkceService {
  private readonly idp = inject(IDP_CONFIG);

  async beginSignIn(): Promise<void> {
    const verifier = this.randomString(64);
    const state = this.randomString(32);
    const nonce = this.randomString(32);
    const challenge = await this.sha256Base64Url(verifier);

    sessionStorage.setItem(STORAGE_VERIFIER, verifier);
    sessionStorage.setItem(STORAGE_STATE, state);
    sessionStorage.setItem(STORAGE_NONCE, nonce);

    const url = new URL(this.idp.authorizeUrl, window.location.origin);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('code_challenge_method', 'S256');
    url.searchParams.set('code_challenge', challenge);
    url.searchParams.set('state', state);
    url.searchParams.set('nonce', nonce);
    url.searchParams.set('client_id', this.idp.clientId);
    url.searchParams.set('redirect_uri', this.idp.redirectUri);
    window.location.href = url.toString();
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
