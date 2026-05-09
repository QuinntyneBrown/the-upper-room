// traces_to: L2-036
import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { SnackbarService } from 'components';
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
  imports: [PartnerContactsTab],
  templateUrl: './partner-detail.html',
  styleUrl: './partner-detail.scss',
})
export class PartnerDetail implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly titleService = inject(Title);
  private readonly snackbar = inject(SnackbarService);

  protected readonly partner = signal<PartnerDetailDto | null>(null);
  protected readonly activeTab = signal<Tab>('overview');
  protected readonly showDeleteDialog = signal(false);
  protected readonly deleteConfirmName = signal('');
  protected readonly deleteBlockedMessage = signal<string | null>(null);

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

  protected openDeleteDialog(): void {
    this.showDeleteDialog.set(true);
    this.deleteConfirmName.set('');
    this.deleteBlockedMessage.set(null);
  }

  protected closeDeleteDialog(): void {
    this.showDeleteDialog.set(false);
  }

  protected confirmDelete(): void {
    const p = this.partner();
    if (!p || this.deleteConfirmName() !== p.name) return;
    this.http.delete(`/api/v1/partners/${p.id}`).subscribe({
      next: () => {
        this.showDeleteDialog.set(false);
        this.snackbar.show('Partner deleted', 'info');
        void this.router.navigateByUrl('/partners');
      },
      error: (err) => {
        if (err.status === 409) {
          this.deleteBlockedMessage.set(err.error?.error ?? 'This partner cannot be deleted.');
        }
      },
    });
  }

  protected archiveInstead(): void {
    const p = this.partner();
    if (!p) return;
    this.http.patch<PartnerDetailDto>(`/api/v1/partners/${p.id}`, { archived: true }).subscribe((updated) => {
      this.partner.set(updated);
      this.showDeleteDialog.set(false);
      this.snackbar.show('Partner archived', 'info');
    });
  }
}
