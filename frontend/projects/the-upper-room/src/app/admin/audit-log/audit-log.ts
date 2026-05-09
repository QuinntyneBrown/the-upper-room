// traces_to: L2-098
import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';

export interface AuditEntryDto {
  readonly id: string;
  readonly timestamp: string;
  readonly actorUserId: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly action: string;
  readonly beforeJson: string | null;
  readonly afterJson: string | null;
}

const ACTIONS = ['', 'Create', 'Update', 'Delete', 'Login', 'PermissionDenied'] as const;

@Component({
  selector: 'app-audit-log',
  imports: [DatePipe],
  templateUrl: './audit-log.html',
  styleUrl: './audit-log.scss',
})
export class AuditLog implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  protected readonly entries = signal<AuditEntryDto[]>([]);
  protected readonly total = signal(0);
  protected readonly page = signal(1);
  protected readonly pageSize = 20;

  protected readonly filterActor = signal('');
  protected readonly filterEntityType = signal('');
  protected readonly filterAction = signal('');

  protected readonly actions = ACTIONS;

  ngOnInit(): void {
    this.fetch();
  }

  protected applyFilters(): void {
    this.page.set(1);
    this.fetch();
  }

  protected prevPage(): void {
    if (this.page() > 1) {
      this.page.update((p) => p - 1);
      this.fetch();
    }
  }

  protected nextPage(): void {
    if (this.page() * this.pageSize < this.total()) {
      this.page.update((p) => p + 1);
      this.fetch();
    }
  }

  private fetch(): void {
    let params = new HttpParams()
      .set('page', String(this.page()))
      .set('pageSize', String(this.pageSize));
    if (this.filterActor()) params = params.set('actor', this.filterActor());
    if (this.filterEntityType()) params = params.set('entityType', this.filterEntityType());
    if (this.filterAction()) params = params.set('action', this.filterAction());

    this.http
      .get<{ items: AuditEntryDto[]; total: number }>('/api/v1/admin/audit', { params })
      .subscribe({
        next: (r) => {
          this.entries.set(r.items);
          this.total.set(r.total);
        },
        error: (err) => {
          if (err.status === 403) this.router.navigateByUrl('/forbidden');
        },
      });
  }
}
