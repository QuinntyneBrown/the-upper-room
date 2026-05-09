// traces_to: L2-034, L2-035
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PERMISSIONS_SERVICE } from 'domain';
import { TarEmptyState } from 'components';

export interface Partner {
  readonly id: string;
  readonly name: string;
  readonly website?: string | null;
  readonly cityId: string;
  readonly contactCount: number;
  readonly tags?: { id: string; name: string; color: string }[];
  readonly archived: boolean;
  readonly logo?: string | null;
}

@Component({
  selector: 'app-partner-list',
  imports: [TarEmptyState],
  templateUrl: './partner-list.html',
  styleUrl: './partner-list.scss',
})
export class PartnerList implements OnInit, OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly perms = inject(PERMISSIONS_SERVICE);
  private readonly destroy$ = new Subject<void>();
  private readonly search$ = new Subject<string>();

  protected readonly partners = signal<Partner[]>([]);
  protected readonly total = signal(0);
  protected readonly searchQuery = signal('');
  protected readonly showArchived = signal(false);
  protected readonly canCreate = computed(() => this.perms.hasPermission('Partner:Create'));
  protected readonly isEmpty = computed(() => this.partners().length === 0);

  ngOnInit(): void {
    this.load();
    this.search$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.load());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private load(): void {
    const params = new URLSearchParams();
    const q = this.searchQuery();
    if (q) params.set('search', q);
    if (this.showArchived()) params.set('archived', 'true');
    this.http
      .get<{ items: Partner[]; total: number }>(`/api/v1/partners?${params.toString()}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe((r) => {
        this.partners.set(r.items);
        this.total.set(r.total);
      });
  }

  protected onSearch(value: string): void {
    this.searchQuery.set(value);
    this.search$.next(value);
  }

  protected toggleArchived(): void {
    this.showArchived.update((v) => !v);
    this.load();
  }

  protected websiteDomain(url: string | null | undefined): string {
    if (!url) return '';
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }

  protected visibleTags(p: Partner): { id: string; name: string; color: string }[] {
    return (p.tags ?? []).slice(0, 3);
  }

  protected extraTagCount(p: Partner): number {
    return Math.max(0, (p.tags?.length ?? 0) - 3);
  }
}
