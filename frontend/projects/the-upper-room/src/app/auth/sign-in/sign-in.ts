// traces_to: L2-016
import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AUTH_PROVIDER } from '../auth-provider.contract';
import { mapErrorToMessage } from '../../interceptors/error-catalog';

@Component({
  selector: 'app-sign-in',
  imports: [RouterLink],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.scss',
})
export class SignIn {
  private readonly auth = inject(AUTH_PROVIDER);
  private readonly router = inject(Router);

  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly showPassword = signal(false);
  protected readonly emailError = signal<string | null>(null);
  protected readonly formError = signal<string | null>(null);
  protected readonly submitting = signal(false);

  protected readonly emailRef = viewChild<ElementRef<HTMLInputElement>>('emailRef');

  protected toggleVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.formError.set(null);
    if (!this.email().trim()) {
      this.emailError.set('Email is required');
      this.emailRef()?.nativeElement.focus();
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
