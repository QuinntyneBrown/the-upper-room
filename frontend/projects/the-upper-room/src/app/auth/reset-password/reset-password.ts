// traces_to: L2-020
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { TarButton, TarPasswordField } from 'components';

@Component({
  selector: 'app-reset-password',
  imports: [RouterLink, TarPasswordField, TarButton],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
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
