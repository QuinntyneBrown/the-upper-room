// traces_to: L2-020
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  imports: [RouterLink],
  template: `
    <section class="page">
      @if (expired()) {
        <div class="card">
          <h1 data-testid="reset-expired">This reset link has expired.</h1>
          <p>Please request a new one.</p>
          <a routerLink="/forgot-password" class="btn">Forgot password</a>
        </div>
      } @else {
        <form class="card" (submit)="onSubmit($event)" novalidate>
          <h1>Reset password</h1>
          <input
            data-testid="reset-new-password"
            class="input"
            type="password"
            autocomplete="new-password"
            placeholder="New password"
            [value]="newPwd()"
            (input)="newPwd.set($any($event.target).value)"
          />
          <input
            data-testid="reset-confirm-password"
            class="input"
            type="password"
            autocomplete="new-password"
            placeholder="Confirm password"
            [value]="confirmPwd()"
            (input)="confirmPwd.set($any($event.target).value)"
          />
          @if (confirmError()) {
            <span data-testid="reset-error-confirm" class="error">{{ confirmError() }}</span>
          }
          <button data-testid="reset-submit" type="submit" class="btn">Reset password</button>
        </form>
      }
    </section>
  `,
  styles: [
    `
      .page {
        min-height: 100dvh;
        display: grid;
        place-items: center;
        padding: var(--md-sys-space-4);
      }
      .card {
        display: grid;
        gap: var(--md-sys-space-3);
        width: 100%;
        max-width: 400px;
        padding: var(--md-sys-space-6);
        background: var(--md-sys-color-surface-container);
        border-radius: var(--md-sys-shape-corner-large);
        box-shadow: var(--md-sys-elevation-level-1);
      }
      h1 {
        margin: 0;
        font: var(--md-sys-typescale-headline-small);
      }
      .input {
        padding: var(--md-sys-space-2) var(--md-sys-space-3);
        border-radius: var(--md-sys-shape-corner-extra-small);
        border: 1px solid var(--md-sys-color-outline);
        font: var(--md-sys-typescale-body-medium);
      }
      .error {
        color: var(--md-sys-color-error);
        font: var(--md-sys-typescale-body-small);
      }
      .btn {
        border: 0;
        border-radius: var(--md-sys-shape-corner-full);
        padding: var(--md-sys-space-3) var(--md-sys-space-6);
        background: var(--md-sys-color-primary);
        color: var(--md-sys-color-on-primary);
        font: var(--md-sys-typescale-label-large);
        text-decoration: none;
        text-align: center;
        cursor: pointer;
      }
    `,
  ],
})
export class ResetPassword {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  protected readonly newPwd = signal('');
  protected readonly confirmPwd = signal('');
  protected readonly expired = signal(false);
  protected readonly confirmError = signal<string | null>(null);

  protected onSubmit(event: Event): void {
    event.preventDefault();
    if (this.newPwd() !== this.confirmPwd()) {
      this.confirmError.set('Passwords do not match.');
      return;
    }
    this.confirmError.set(null);
    const token = this.route.snapshot.queryParamMap.get('token') ?? '';
    this.http
      .post('/api/v1/auth/reset-password', { token, newPassword: this.newPwd() })
      .subscribe({
        next: () => this.router.navigateByUrl('/sign-in?reset=1'),
        error: (err: HttpErrorResponse) => {
          if (err.status === 410) this.expired.set(true);
        },
      });
  }
}
