// traces_to: L2-015
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PkceService } from '../pkce.service';
import { AccessTokenStore } from '../access-token-store';
import { SnackbarService } from '../../../../../components/src/lib/snackbar/tar-snackbar.service';

@Component({
  selector: 'app-auth-callback',
  template: `<p>Signing you in…</p>`,
})
export class AuthCallback implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly pkce = inject(PkceService);
  private readonly tokens = inject(AccessTokenStore);
  private readonly snackbar = inject(SnackbarService);

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const code = params.get('code');
    const incomingState = params.get('state');
    const { verifier, state } = this.pkce.consumeState();

    if (!code || !verifier || incomingState !== state) {
      this.snackbar.show('Sign-in failed. Please try again.', 'error');
      this.router.navigateByUrl('/sign-in');
      return;
    }

    this.http
      .post<{ accessToken: string }>('/api/v1/auth/exchange', { code, codeVerifier: verifier })
      .subscribe({
        next: ({ accessToken }) => {
          this.tokens.set(accessToken);
          this.router.navigateByUrl('/dashboard');
        },
        error: () => {
          this.snackbar.show('Sign-in failed. Please try again.', 'error');
          this.router.navigateByUrl('/sign-in');
        },
      });
  }
}
