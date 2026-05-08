// traces_to: L2-016
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TarButton, TarPasswordField, TarTextField } from 'components';
import { AUTH_PROVIDER } from '../auth-provider.contract';
import { mapErrorToMessage } from '../../interceptors/error-catalog';

@Component({
  selector: 'app-sign-in',
  imports: [RouterLink, TarTextField, TarPasswordField, TarButton],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.scss',
})
export class SignIn {
  private readonly auth = inject(AUTH_PROVIDER);
  private readonly router = inject(Router);

  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly emailError = signal<string | null>(null);
  protected readonly formError = signal<string | null>(null);
  protected readonly submitting = signal(false);

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.formError.set(null);
    if (!this.email().trim()) {
      this.emailError.set('Email is required');
      return;
    }
    this.emailError.set(null);
    this.submitting.set(true);
    this.auth.signIn(this.email(), this.password()).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigateByUrl('/dashboard');
      },
      error: (err: { code?: string }) => {
        this.submitting.set(false);
        this.formError.set(mapErrorToMessage(401, err?.code));
      },
    });
  }
}
