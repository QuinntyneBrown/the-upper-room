// traces_to: L2-018
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { TarIcon } from '../../../../../components/src/lib/icon/icon';

const RESEND_COOLDOWN_SECONDS = 60;

type State = 'waiting' | 'verifying' | 'verified' | 'expired';

@Component({
  selector: 'app-verify-email',
  imports: [TarIcon, RouterLink],
  template: `
    <section class="page">
      @switch (state()) {
        @case ('verifying') {
          <p>Verifying your email…</p>
        }
        @case ('verified') {
          <tar-icon name="success" size="xl" />
          <h1 data-testid="verify-email-verified">Email verified</h1>
          <a data-testid="verify-email-dashboard" routerLink="/dashboard" class="btn">
            Go to dashboard
          </a>
        }
        @case ('expired') {
          <tar-icon name="warning" size="xl" />
          <h1 data-testid="verify-email-expired">Link expired</h1>
          <p>Verification links are valid for 24 hours.</p>
          <button data-testid="verify-email-send-new" type="button" class="btn" (click)="resend()">
            Send a new link
          </button>
        }
        @default {
          <tar-icon name="info" size="xl" />
          <h1>Verify your email</h1>
          <p>We sent you a link to confirm your address.</p>
          <button
            data-testid="verify-email-resend"
            type="button"
            class="btn btn--ghost"
            [disabled]="cooldown() > 0"
            (click)="resend()"
          >
            Resend email
          </button>
          @if (cooldown() > 0) {
            <span data-testid="verify-email-cooldown" class="cooldown">
              Please wait {{ cooldown() }}s before requesting another email
            </span>
          }
        }
      }
    </section>
  `,
  styles: [
    `
      .page {
        min-height: 100dvh;
        display: grid;
        place-items: center;
        text-align: center;
        gap: var(--md-sys-space-3);
        padding: var(--md-sys-space-6);
      }
      h1 {
        margin: 0;
        font: var(--md-sys-typescale-headline-small);
      }
      p {
        margin: 0;
        color: var(--md-sys-color-on-surface-variant);
      }
      .btn {
        border: 0;
        border-radius: var(--md-sys-shape-corner-full);
        padding: var(--md-sys-space-3) var(--md-sys-space-6);
        background: var(--md-sys-color-primary);
        color: var(--md-sys-color-on-primary);
        font: var(--md-sys-typescale-label-large);
        text-decoration: none;
        cursor: pointer;
      }
      .btn--ghost {
        background: transparent;
        color: var(--md-sys-color-primary);
        border: 1px solid var(--md-sys-color-outline);
      }
      .btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
      .cooldown {
        color: var(--md-sys-color-on-surface-variant);
        font: var(--md-sys-typescale-body-small);
      }
    `,
  ],
})
export class VerifyEmail implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  protected readonly state = signal<State>('waiting');
  protected readonly cooldown = signal(0);

  private timerId: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    if (this.router.url.startsWith('/verify-email/confirm')) {
      this.confirm();
    }
  }

  ngOnDestroy(): void {
    if (this.timerId !== null) clearInterval(this.timerId);
  }

  protected resend(): void {
    this.http.post('/api/v1/auth/verify-email/resend', {}).subscribe({ error: () => {} });
    this.startCooldown();
  }

  private confirm(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.state.set('expired');
      return;
    }
    this.state.set('verifying');
    this.http.post('/api/v1/auth/verify-email', { token }).subscribe({
      next: () => this.state.set('verified'),
      error: (_err: HttpErrorResponse) => this.state.set('expired'),
    });
  }

  private startCooldown(): void {
    this.cooldown.set(RESEND_COOLDOWN_SECONDS);
    if (this.timerId !== null) clearInterval(this.timerId);
    this.timerId = setInterval(() => {
      const next = this.cooldown() - 1;
      this.cooldown.set(next);
      if (next <= 0 && this.timerId !== null) {
        clearInterval(this.timerId);
        this.timerId = null;
      }
    }, 1000);
  }
}
