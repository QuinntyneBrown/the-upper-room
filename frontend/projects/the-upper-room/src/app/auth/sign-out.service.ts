// traces_to: L2-021
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { ConfirmService } from '../../../../components/src/lib/confirm-dialog/confirm.service';
import { SnackbarService } from '../../../../components/src/lib/snackbar/tar-snackbar.service';
import { AccessTokenStore } from './access-token-store';

@Injectable({ providedIn: 'root' })
export class SignOutService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly confirm = inject(ConfirmService);
  private readonly snackbar = inject(SnackbarService);
  private readonly tokens = inject(AccessTokenStore);

  async signOut(): Promise<void> {
    const ok = await this.confirm.confirm({
      title: 'Sign out?',
      body: 'You can sign back in any time.',
      severity: 'info',
      confirmLabel: 'Sign out',
    });
    if (!ok) return;

    this.http
      .post('/api/v1/auth/sign-out', {})
      .pipe(catchError(() => of(null)))
      .subscribe(() => {
        this.tokens.set(null);
        this.snackbar.show("You've been signed out.", 'info');
        this.router.navigateByUrl('/sign-in?signedOut=1');
      });
  }
}
