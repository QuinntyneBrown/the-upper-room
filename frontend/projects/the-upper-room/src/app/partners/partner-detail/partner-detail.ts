// traces_to: L2-036
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmService, SnackbarService, TarButton, TarTab, TarTabs } from 'components';
import type { Partner } from '../partner-list/partner-list';
import { PartnerContactsTab } from '../partner-contacts-tab/partner-contacts-tab';

type Tab = 'overview' | 'contacts' | 'activity';

interface PartnerDetailDto extends Partner {
  readonly descriptionMarkdown?: string | null;
  readonly addresses: { street?: string; city?: string; country?: string }[];
  readonly socialLinks: { platform: string; url: string; label?: string }[];
}

@Component({
  selector: 'app-partner-detail',
  imports: [PartnerContactsTab, TarButton, TarTabs, RouterLink, MatIconModule],
  templateUrl: './partner-detail.html',
  styleUrl: './partner-detail.scss',
})
export class PartnerDetail implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly titleService = inject(Title);
  private readonly snackbar = inject(SnackbarService);
  private readonly confirm = inject(ConfirmService);

  protected readonly partner = signal<PartnerDetailDto | null>(null);
  protected readonly activeTab = signal<Tab>('overview');

  protected readonly TABS: readonly TarTab[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'contacts', label: 'Contacts' },
    { id: 'activity', label: 'Activity' },
  ];

  protected readonly tabIndex = computed(() => this.TABS.findIndex((t) => t.id === this.activeTab()));

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.http.get<PartnerDetailDto>(`/api/v1/partners/${id}`).subscribe((p) => {
      this.partner.set(p);
      this.titleService.setTitle(`${p.name} · The Upper Room`);
    });
  }

  protected websiteDomain(url: string): string {
    try { return new URL(url).hostname; } catch { return url; }
  }

  protected onTabChange(index: number): void {
    this.activeTab.set(this.TABS[index].id as Tab);
  }

  protected archive(): void {
    const p = this.partner();
    if (!p) return;
    const nowArchived = !p.archived;
    this.http.patch<PartnerDetailDto>(`/api/v1/partners/${p.id}`, { archived: nowArchived }).subscribe((updated) => {
      this.partner.set(updated);
      const msg = nowArchived ? 'Partner archived' : 'Partner restored';
      this.snackbar.show(msg, 'info', {
        label: 'Undo',
        onClick: () => {
          this.http.patch<PartnerDetailDto>(`/api/v1/partners/${p.id}`, { archived: !nowArchived })
            .subscribe((r) => this.partner.set(r));
        },
      });
    });
  }

  protected async openDeleteDialog(): Promise<void> {
    const p = this.partner();
    if (!p) return;

    const confirmed = await this.confirm.confirm({
      title: 'Delete partner?',
      body: `Type "${p.name}" to confirm permanent deletion.`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      severity: 'danger',
      requireTypedConfirmation: p.name,
    });

    if (!confirmed) return;

    this.http.delete(`/api/v1/partners/${p.id}`).subscribe({
      next: () => {
        this.snackbar.show('Partner deleted', 'info');
        void this.router.navigateByUrl('/partners');
      },
      error: async (err) => {
        if (err.status === 409) {
          const message = err.error?.error ?? 'This partner cannot be deleted.';
          const archive = await this.confirm.confirm({
            title: 'Cannot delete',
            body: message,
            confirmLabel: 'Archive instead',
            cancelLabel: 'Cancel',
            severity: 'warning',
          });
          if (archive) this.archiveInstead();
        }
      },
    });
  }

  private archiveInstead(): void {
    const p = this.partner();
    if (!p) return;
    this.http.patch<PartnerDetailDto>(`/api/v1/partners/${p.id}`, { archived: true }).subscribe((updated) => {
      this.partner.set(updated);
      this.snackbar.show('Partner archived', 'info');
    });
  }
}
