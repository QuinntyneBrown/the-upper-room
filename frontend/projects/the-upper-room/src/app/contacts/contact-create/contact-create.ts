// traces_to: L2-032, L2-029
import { Component, ElementRef, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ConfirmService } from '../../../../../components/src/lib/confirm-dialog/confirm.service';
import { SnackbarService } from '../../../../../components/src/lib/snackbar/tar-snackbar.service';
import { TarTagSelector, Tag } from 'domain';

export interface PhoneRow { value: string; label: string; primary: boolean; error: string | null }
export interface EmailRow { value: string; label: string; primary: boolean }
export interface AddressRow { street: string; city: string; country: string }

const E164_RE = /^\+?[1-9]\d{1,14}$/;

@Component({
  selector: 'app-contact-create',
  imports: [TarTagSelector],
  templateUrl: './contact-create.html',
  styleUrl: './contact-create.scss',
})
export class ContactCreate {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly confirm = inject(ConfirmService);
  private readonly snackbar = inject(SnackbarService);
  private readonly host = inject(ElementRef<HTMLElement>);

  protected readonly firstName = signal('');
  protected readonly lastName = signal('');
  protected readonly pronouns = signal('');
  protected readonly title = signal('');
  protected readonly org = signal('');
  protected readonly displayName = signal('');

  protected readonly phones = signal<PhoneRow[]>([]);
  protected readonly emails = signal<EmailRow[]>([]);
  protected readonly addresses = signal<AddressRow[]>([]);
  protected readonly tags = signal<Tag[]>([]);

  protected readonly firstNameError = signal<string | null>(null);
  protected readonly formBanner = signal<string | null>(null);
  protected readonly submitting = signal(false);

  protected readonly isDirty = computed(
    () =>
      this.firstName().length > 0 ||
      this.lastName().length > 0 ||
      this.pronouns().length > 0 ||
      this.title().length > 0 ||
      this.org().length > 0 ||
      this.displayName().length > 0 ||
      this.phones().length > 0 ||
      this.emails().length > 0 ||
      this.addresses().length > 0 ||
      this.tags().length > 0,
  );

  protected addPhone(): void {
    this.phones.update((p) => [...p, { value: '', label: '', primary: false, error: null }]);
    requestAnimationFrame(() => {
      const idx = this.phones().length - 1;
      (this.host.nativeElement.querySelector(`[data-testid="contact-phone-input-${idx}"]`) as HTMLElement)?.focus();
    });
  }

  protected removePhone(index: number): void {
    this.phones.update((p) => p.filter((_, i) => i !== index));
  }

  protected updatePhone(index: number, field: keyof PhoneRow, value: string | boolean): void {
    this.phones.update((rows) =>
      rows.map((r, i) => (i === index ? { ...r, [field]: value } : r)),
    );
  }

  protected addEmail(): void {
    this.emails.update((e) => [...e, { value: '', label: '', primary: false }]);
    requestAnimationFrame(() => {
      const idx = this.emails().length - 1;
      (this.host.nativeElement.querySelector(`[data-testid="contact-email-input-${idx}"]`) as HTMLElement)?.focus();
    });
  }

  protected updateEmail(index: number, field: keyof EmailRow, value: string | boolean): void {
    this.emails.update((rows) =>
      rows.map((r, i) => (i === index ? { ...r, [field]: value } : r)),
    );
  }

  protected addAddress(): void {
    this.addresses.update((a) => [...a, { street: '', city: '', country: '' }]);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.firstNameError.set(null);
    this.formBanner.set(null);

    const first = this.firstName().trim();
    if (!first) {
      this.firstNameError.set('First name is required.');
      (this.host.nativeElement.querySelector('[data-testid="contact-first-name"]') as HTMLElement)?.focus();
      return;
    }

    const phonesWithErrors = this.phones().map((p) => ({
      ...p,
      error: p.value && !E164_RE.test(p.value.replace(/[\s\-\(\)]/g, '')) ? 'Enter a valid phone number.' : null,
    }));
    this.phones.set(phonesWithErrors);
    if (phonesWithErrors.some((p) => p.error)) return;

    const primaryEmailCount = this.emails().filter((e) => e.primary).length;
    if (primaryEmailCount > 1) {
      this.formBanner.set('Only one primary email is allowed.');
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
        phones: this.phones().map((p) => ({ value: p.value, label: p.label, primary: p.primary })),
        emails: this.emails().map((e) => ({ value: e.value, label: e.label, primary: e.primary })),
        addresses: this.addresses(),
        tags: this.tags().map((t) => t.id),
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
