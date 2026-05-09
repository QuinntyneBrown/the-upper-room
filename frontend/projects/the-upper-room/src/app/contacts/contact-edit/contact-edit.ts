// traces_to: L2-032
import { Component, ElementRef, OnInit, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmService } from '../../../../../components/src/lib/confirm-dialog/confirm.service';
import { SnackbarService } from '../../../../../components/src/lib/snackbar/tar-snackbar.service';
import { TarButton, TarTextField } from 'components';
import { TarTagSelector, Tag } from 'domain';
import type { PhoneRow, EmailRow, AddressRow } from '../contact-create/contact-create';

const E164_RE = /^\+?[1-9]\d{1,14}$/;

@Component({
  selector: 'app-contact-edit',
  imports: [TarButton, TarTextField, TarTagSelector],
  templateUrl: './contact-edit.html',
  styleUrl: './contact-edit.scss',
})
export class ContactEdit implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly confirm = inject(ConfirmService);
  private readonly snackbar = inject(SnackbarService);
  private readonly host = inject(ElementRef<HTMLElement>);

  private contactId = '';

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
  protected readonly isDirty = signal(false);

  ngOnInit(): void {
    this.contactId = this.route.snapshot.paramMap.get('id')!;
    this.http.get<Record<string, unknown>>(`/api/v1/contacts/${this.contactId}`).subscribe((c) => {
      this.firstName.set((c['firstName'] as string | undefined) ?? (c['name'] as string ?? '').split(' ')[0] ?? '');
      this.lastName.set((c['lastName'] as string | undefined) ?? (c['name'] as string ?? '').split(' ').slice(1).join(' ') ?? '');
      this.pronouns.set((c['pronouns'] as string | undefined) ?? '');
      this.title.set((c['title'] as string | undefined) ?? '');
      this.org.set((c['org'] as string | undefined) ?? '');
      this.displayName.set((c['displayName'] as string | undefined) ?? '');
      this.tags.set((c['tags'] as Tag[] | undefined) ?? []);
    });
  }

  protected setDirty(): void {
    this.isDirty.set(true);
  }

  protected addPhone(): void {
    this.phones.update((p) => [...p, { value: '', label: '', primary: false, error: null }]);
    this.isDirty.set(true);
    requestAnimationFrame(() => {
      const idx = this.phones().length - 1;
      (this.host.nativeElement.querySelector(`[data-testid="contact-phone-input-${idx}"]`) as HTMLElement)?.focus();
    });
  }

  protected removePhone(index: number): void {
    this.phones.update((p) => p.filter((_, i) => i !== index));
    this.isDirty.set(true);
  }

  protected updatePhone(index: number, field: keyof PhoneRow, value: string | boolean): void {
    this.phones.update((rows) =>
      rows.map((r, i) => (i === index ? { ...r, [field]: value } : r)),
    );
    this.isDirty.set(true);
  }

  protected addEmail(): void {
    this.emails.update((e) => [...e, { value: '', label: '', primary: false }]);
    this.isDirty.set(true);
  }

  protected updateEmail(index: number, field: keyof EmailRow, value: string | boolean): void {
    this.emails.update((rows) =>
      rows.map((r, i) => (i === index ? { ...r, [field]: value } : r)),
    );
    this.isDirty.set(true);
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
      .put<{ id: string; name: string }>(`/api/v1/contacts/${this.contactId}`, {
        firstName: first,
        lastName: this.lastName().trim(),
        pronouns: this.pronouns().trim(),
        title: this.title().trim(),
        org: this.org().trim(),
        displayName: this.displayName().trim() || name,
        tags: this.tags().map((t) => t.id),
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.snackbar.show('Contact updated', 'success');
          this.router.navigateByUrl(`/contacts/${this.contactId}`);
        },
        error: (err: HttpErrorResponse) => {
          this.submitting.set(false);
          if (err.status === 409) {
            this.formBanner.set('This contact was modified elsewhere. Reload to see latest.');
          }
        },
      });
  }

  protected async onCancel(): Promise<void> {
    if (!this.isDirty()) {
      this.router.navigateByUrl(`/contacts/${this.contactId}`);
      return;
    }
    const discard = await this.confirm.confirm({
      title: 'Discard changes?',
      body: 'Your unsaved changes will be lost.',
      confirmLabel: 'Discard',
      cancelLabel: 'Keep editing',
      severity: 'warning',
    });
    if (discard) this.router.navigateByUrl(`/contacts/${this.contactId}`);
  }

  protected onReload(): void {
    this.router.navigateByUrl(`/contacts/${this.contactId}/edit`);
  }
}
