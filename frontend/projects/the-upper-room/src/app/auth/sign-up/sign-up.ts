// traces_to: L2-017
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient, HttpContext, HttpErrorResponse } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { SKIP_ERROR_SNACKBAR } from 'api';
import {
  evaluatePassword,
  SnackbarService,
  TarButton,
  TarCheckbox,
  TarPasswordField,
  TarPasswordStrength,
  TarTextField,
} from 'components';

@Component({
  selector: 'app-sign-up',
  imports: [
    RouterLink,
    TarTextField,
    TarPasswordField,
    TarPasswordStrength,
    TarCheckbox,
    TarButton,
  ],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.scss',
})
export class SignUp implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly snackbar = inject(SnackbarService);

  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly city = signal('');
  protected readonly termsAccepted = signal(false);
  protected readonly fromInvitation = signal(false);
  protected readonly invitationExpired = signal(false);
  protected readonly emailError = signal<string | null>(null);
  protected readonly submitting = signal(false);

  protected readonly passwordEval = computed(() =>
    evaluatePassword(this.password(), this.email()),
  );

  protected readonly canSubmit = computed(
    () =>
      !this.submitting() &&
      this.termsAccepted() &&
      this.isValidEmail(this.email()) &&
      this.passwordEval().score >= 3 &&
      this.city().trim().length > 0,
  );

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) return;
    this.http
      .get<{ email: string; city: string }>(`/api/v1/invitations?token=${encodeURIComponent(token)}`, {
        context: new HttpContext().set(SKIP_ERROR_SNACKBAR, true),
      })
      .pipe(catchError(() => of(null)))
      .subscribe((res) => {
        if (!res) {
          this.invitationExpired.set(true);
          return;
        }
        this.email.set(res.email);
        this.city.set(res.city);
        this.fromInvitation.set(true);
      });
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.emailError.set(null);
    this.submitting.set(true);
    this.http
      .post('/api/v1/auth/sign-up', {
        email: this.email(),
        password: this.password(),
        city: this.city(),
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.snackbar.show('Account created! Check your email to verify.', 'success');
          this.router.navigateByUrl('/verify-email');
        },
        error: (err: HttpErrorResponse) => {
          this.submitting.set(false);
          if (err.status === 409) {
            this.emailError.set(
              'An account with this email already exists. Try signing in.',
            );
          }
        },
      });
  }

  private isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }
}
