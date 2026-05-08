// traces_to: L2-032, L2-029
import { Component, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ConfirmService } from '../../../../../components/src/lib/confirm-dialog/confirm.service';
import { SnackbarService } from '../../../../../components/src/lib/snackbar/tar-snackbar.service';

@Component({
  selector: 'app-contact-create',
  imports: [],
  templateUrl: './contact-create.html',
  styleUrl: './contact-create.scss',
})
export class ContactCreate {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly confirm = inject(ConfirmService);
  private readonly snackbar = inject(SnackbarService);

  protected readonly firstName = signal('');
  protected readonly lastName = signal('');
  protected readonly pronouns = signal('');
  protected readonly title = signal('');
  protected readonly org = signal('');
  protected readonly displayName = signal('');

  protected readonly firstNameError = signal<string | null>(null);
  protected readonly submitting = signal(false);
  protected readonly isDirty = computed(
    () =>
      this.firstName().length > 0 ||
      this.lastName().length > 0 ||
      this.pronouns().length > 0 ||
      this.title().length > 0 ||
      this.org().length > 0 ||
      this.displayName().length > 0,
  );

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.firstNameError.set(null);
    const first = this.firstName().trim();
    if (!first) {
      this.firstNameError.set('First name is required.');
      (document.querySelector('[data-testid="contact-first-name"]') as HTMLElement)?.focus();
      return;
    }
    this.submitting.set(true);
    const name = [first, this.lastName().trim()].filter(Boolean).join(' ');
    this.http
      .post<{ id: string; name: string; cityId: string }>('/api/v1/contacts', {
        firstName: first,
        lastName: this.lastName().trim(),
        pronouns: this.pronouns().trim(),
        title: this.title().trim(),
        org: this.org().trim(),
        displayName: this.displayName().trim() || name,
      })
      .subscribe({
        next: (contact) => {
          this.submitting.set(false);
          this.snackbar.show('Contact created', 'success');
          this.router.navigateByUrl(`/contacts/${contact.id}`);
        },
        error: () => {
          this.submitting.set(false);
        },
      });
  }

  protected async onCancel(): Promise<void> {
    if (!this.isDirty()) {
      this.router.navigateByUrl('/contacts');
      return;
    }
    const discard = await this.confirm.confirm({
      title: 'Discard changes?',
      body: 'Your unsaved changes will be lost.',
      confirmLabel: 'Discard',
      cancelLabel: 'Keep editing',
      severity: 'warning',
    });
    if (discard) this.router.navigateByUrl('/contacts');
  }
}
