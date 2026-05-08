// traces_to: L2-020
import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-forgot-password',
  template: `
    <section class="page">
      <form class="card" (submit)="onSubmit($event)" novalidate>
        <h1>Forgot password</h1>
        <input
          data-testid="forgot-email"
          class="input"
          type="email"
          autocomplete="email"
          placeholder="Email"
          [value]="email()"
          (input)="email.set($any($event.target).value)"
        />
        <button data-testid="forgot-submit" type="submit" class="btn">
          Send reset link
        </button>
        @if (sent()) {
          <p data-testid="forgot-message" class="message">
            If an account exists for {{ submittedEmail() }}, a reset link has been sent.
          </p>
        }
      </form>
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
        gap: var(--md-sys-space-4);
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
      .btn {
        border: 0;
        border-radius: var(--md-sys-shape-corner-full);
        padding: var(--md-sys-space-3) var(--md-sys-space-6);
        background: var(--md-sys-color-primary);
        color: var(--md-sys-color-on-primary);
        font: var(--md-sys-typescale-label-large);
        cursor: pointer;
      }
      .message {
        margin: 0;
        color: var(--md-sys-color-on-surface-variant);
        font: var(--md-sys-typescale-body-medium);
      }
    `,
  ],
})
export class ForgotPassword {
  private readonly http = inject(HttpClient);

  protected readonly email = signal('');
  protected readonly submittedEmail = signal('');
  protected readonly sent = signal(false);

  protected onSubmit(event: Event): void {
    event.preventDefault();
    const value = this.email().trim();
    this.submittedEmail.set(value);
    // Anti-enumeration: always show the same generic message regardless of API outcome.
    this.http
      .post('/api/v1/auth/forgot-password', { email: value })
      .pipe(catchError(() => of(null)))
      .subscribe(() => this.sent.set(true));
  }
}
