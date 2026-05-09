// traces_to: L2-037
import { Component, ElementRef, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TarButton, TarTextField, ConfirmService, SnackbarService } from 'components';

const URL_RE = /^https?:\/\//i;

@Component({
  selector: 'app-partner-create',
  imports: [TarButton, TarTextField, MatIconModule],
  templateUrl: './partner-create.html',
  styleUrl: './partner-create.scss',
})
export class PartnerCreate {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly confirm = inject(ConfirmService);
  private readonly snackbar = inject(SnackbarService);
  private readonly host = inject(ElementRef<HTMLElement>);

  protected readonly name = signal('');
  protected readonly website = signal('');

  protected readonly nameError = signal<string | null>(null);
  protected readonly websiteError = signal<string | null>(null);
  protected readonly formBanner = signal<string | null>(null);
  protected readonly submitting = signal(false);

  protected readonly websiteValid = computed(() => !this.website() || URL_RE.test(this.website()));
  protected readonly isDirty = computed(() => this.name().length > 0 || this.website().length > 0);

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.nameError.set(null);
    this.websiteError.set(null);
    this.formBanner.set(null);

    const nameVal = this.name().trim();
    if (!nameVal) {
      this.nameError.set('Name is required.');
      (this.host.nativeElement.querySelector('[data-testid="partner-name"]') as HTMLElement)?.focus();
      return;
    }

    const websiteVal = this.website().trim();
    if (websiteVal && !URL_RE.test(websiteVal)) {
      this.websiteError.set('Website must start with http:// or https://');
      (this.host.nativeElement.querySelector('[data-testid="partner-website"]') as HTMLElement)?.focus();
      return;
    }

    this.submitting.set(true);
    this.http
      .post<{ id: string }>('/api/v1/partners', { name: nameVal, website: websiteVal || null })
      .subscribe({
        next: (partner) => {
          this.submitting.set(false);
          this.snackbar.show('Partner created', 'success');
          void this.router.navigateByUrl(`/partners/${partner.id}`);
        },
        error: (err) => {
          this.submitting.set(false);
          if (err.status === 409) {
            this.formBanner.set(err.error?.error ?? 'A partner with this name already exists in your city.');
          }
        },
      });
  }

  protected async onCancel(): Promise<void> {
    if (!this.isDirty()) {
      void this.router.navigateByUrl('/partners');
      return;
    }
    const discard = await this.confirm.confirm({
      title: 'Discard changes?',
      body: 'Your unsaved changes will be lost.',
      confirmLabel: 'Discard',
      cancelLabel: 'Keep editing',
      severity: 'warning',
    });
    if (discard) void this.router.navigateByUrl('/partners');
  }
}
