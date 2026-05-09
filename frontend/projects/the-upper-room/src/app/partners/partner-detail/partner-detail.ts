// traces_to: L2-036
import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import type { Partner } from '../partner-list/partner-list';

type Tab = 'overview' | 'contacts' | 'activity';

interface PartnerDetailDto extends Partner {
  readonly descriptionMarkdown?: string | null;
  readonly addresses: { street?: string; city?: string; country?: string }[];
  readonly socialLinks: { platform: string; url: string }[];
}

@Component({
  selector: 'app-partner-detail',
  imports: [],
  templateUrl: './partner-detail.html',
  styleUrl: './partner-detail.scss',
})
export class PartnerDetail implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly titleService = inject(Title);

  protected readonly partner = signal<PartnerDetailDto | null>(null);
  protected readonly activeTab = signal<Tab>('overview');

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
}
