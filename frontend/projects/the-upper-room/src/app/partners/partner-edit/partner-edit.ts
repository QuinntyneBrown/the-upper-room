// traces_to: L2-037
import { Component, ElementRef, OnInit, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmService, SnackbarService } from 'components';

const URL_RE = /^https?:\/\//i;

@Component({
  selector: 'app-partner-edit',
  imports: [],
  templateUrl: './partner-edit.html',
  styleUrl: './partner-edit.scss',
})
export class PartnerEdit implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly confirm = inject(ConfirmService);
  private readonly snackbar = inject(SnackbarService);
  private readonly host = inject(ElementRef<HTMLElement>);

  protected partnerId = '';
  protected readonly name = signal('');
  protected readonly website = signal('');
  protected readonly originalName = signal('');
  protected readonly originalWebsite = signal('');

  protected readonly nameError = signal<string | null>(null);
  protected readonly websiteError = signal<string | null>(null);
  protected readonly formBanner = signal<string | null>(null);
  protected readonly submitting = signal(false);
  protected readonly loading = signal(true);

  protected readonly websiteValid = computed(() => !this.website() || URL_RE.test(this.website()));
  protected readonly isDirty = computed(
    () => this.name() !== this.originalName() || this.website() !== this.originalWebsite(),
  );

  ngOnInit(): void {
    this.partnerId = this.route.snapshot.paramMap.get('id')!;
    this.http.get<{ id: string; name: string; website?: string | null }>(`/api/v1/partners/${this.partnerId}`)
      .subscribe((p) => {
        this.name.set(p.name);
        this.website.set(p.website ?? '');
        this.originalName.set(p.name);
        this.originalWebsite.set(p.website ?? '');
        this.loading.set(false);
      });
  }

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
      return;
    }

    this.submitting.set(true);
    this.http
      .put<{ id: string }>(`/api/v1/partners/${this.partnerId}`, { name: nameVal, website: websiteVal || null })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.snackbar.show('Partner updated', 'success');
          void this.router.navigateByUrl(`/partners/${this.partnerId}`);
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
      void this.router.navigateByUrl(`/partners/${this.partnerId}`);
      return;
    }
    const discard = await this.confirm.confirm({
      title: 'Discard changes?',
      body: 'Your unsaved changes will be lost.',
      confirmLabel: 'Discard',
      cancelLabel: 'Keep editing',
      severity: 'warning',
    });
    if (discard) void this.router.navigateByUrl(`/partners/${this.partnerId}`);
  }
}
