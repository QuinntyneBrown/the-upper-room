// traces_to: L2-018
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { TarButton, TarIcon } from 'components';

const RESEND_COOLDOWN_SECONDS = 60;

type State = 'waiting' | 'verifying' | 'verified' | 'expired';

@Component({
  selector: 'app-verify-email',
  imports: [TarIcon, TarButton, RouterLink],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.scss',
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
