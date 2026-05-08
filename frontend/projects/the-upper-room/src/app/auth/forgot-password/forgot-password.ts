// traces_to: L2-020
import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { TarButton, TarTextField } from 'components';

@Component({
  selector: 'app-forgot-password',
  imports: [TarTextField, TarButton],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
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
    this.http
      .post('/api/v1/auth/forgot-password', { email: value })
      .pipe(catchError(() => of(null)))
      .subscribe(() => this.sent.set(true));
  }
}
