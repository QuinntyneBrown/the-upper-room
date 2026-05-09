// traces_to: L2-029, L2-030, L2-112
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { MatChipsModule } from '@angular/material/chips';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CITY_SCOPE_SERVICE, PERMISSIONS_SERVICE } from 'domain';
import { TarEmptyState, TarAvatar, TarButton, TarSearchField } from 'components';

export interface ContactPhone {
  readonly value: string;
  readonly label?: string;
  readonly primary: boolean;
}

export interface ContactEmail {
  readonly value: string;
  readonly label?: string;
  readonly primary: boolean;
}

export interface Contact {
  readonly id: string;
  readonly name: string;
  readonly cityId: string;
  readonly title?: string;
  readonly org?: string;
  readonly phones?: ContactPhone[];
  readonly emails?: ContactEmail[];
  readonly tags?: { id: string; name: string; color: string }[];
  readonly archived?: boolean;
}

const PAGE_SIZE = 25;

@Component({
  selector: 'app-contact-list',
  imports: [RouterLink, MatChipsModule, TarEmptyState, TarAvatar, TarButton, TarSearchField],
  templateUrl: './contact-list.html',
  styleUrl: './contact-list.scss',
})
export class ContactList implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('scrollSentinel') scrollSentinel?: ElementRef<HTMLElement>;

  private readonly http = inject(HttpClient);
  private readonly perms = inject(PERMISSIONS_SERVICE);
  private readonly cityScope = inject(CITY_SCOPE_SERVICE);
  private readonly destroy$ = new Subject<void>();
  private readonly search$ = new Subject<string>();
  private observer?: IntersectionObserver;
  private loading = false;

  protected readonly contacts = signal<Contact[]>([]);
  protected readonly total = signal(0);
  protected readonly currentPage = signal(1);
  protected readonly searchQuery = signal('');
  protected readonly showArchived = signal(false);
  protected readonly isXs = signal(window.innerWidth < 768);
  protected readonly canCreate = computed(() => this.perms.hasPermission('Contact:Create'));
  protected readonly isEmpty = computed(() => this.contacts().length === 0);
  protected readonly hasMore = computed(() => this.contacts().length < this.total());
  protected readonly pageInfo = computed(() => {
    const from = (this.currentPage() - 1) * PAGE_SIZE + 1;
    const to = Math.min(this.currentPage() * PAGE_SIZE, this.total());
    return `${from} – ${to} of ${this.total()}`;
  });
  protected readonly totalPages = computed(() => Math.ceil(this.total() / PAGE_SIZE));

  constructor() {
    effect(() => {
      this.cityScope.current();
      this.contacts.set([]);
      this.currentPage.set(1);
      this.loadPage(1);
    });
  }

  ngOnInit(): void {
    this.search$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.contacts.set([]);
        this.currentPage.set(1);
        this.loadPage(1);
      });
  }

  ngAfterViewInit(): void {
    if (!this.isXs() || typeof IntersectionObserver === 'undefined') return;
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && this.hasMore() && !this.loading) {
          this.loadMore();
        }
      },
      { threshold: 0.1 },
    );
    if (this.scrollSentinel) {
      this.observer.observe(this.scrollSentinel.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildParams(page: number): string {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('size', String(PAGE_SIZE));
    const q = this.searchQuery();
    if (q) params.set('search', q);
    if (this.showArchived()) params.set('archived', 'true');
    if (this.perms.hasPermission('City:Switch')) {
      const scope = this.cityScope.current();
      if (scope) params.set('scope', scope);
    }
    return params.toString();
  }

  private loadPage(page: number): void {
    this.loading = true;
    this.http
      .get<{ items: Contact[]; total: number }>(`/api/v1/contacts?${this.buildParams(page)}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe((r) => {
        this.contacts.set(r.items);
        this.total.set(r.total);
        this.currentPage.set(page);
        this.loading = false;
      });
  }

  protected loadMore(): void {
    if (!this.hasMore() || this.loading) return;
    this.loading = true;
    const next = this.currentPage() + 1;
    this.http
      .get<{ items: Contact[]; total: number }>(`/api/v1/contacts?${this.buildParams(next)}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe((r) => {
        this.contacts.update((prev) => {
          const ids = new Set(prev.map((c) => c.id));
          return [...prev, ...r.items.filter((c) => !ids.has(c.id))];
        });
        this.total.set(r.total);
        this.currentPage.set(next);
        this.loading = false;
      });
  }

  protected goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.loadPage(page);
  }

  protected onSearch(value: string): void {
    this.searchQuery.set(value);
    this.search$.next(value);
  }

  protected toggleArchived(): void {
    this.showArchived.update((v) => !v);
    this.search$.next(this.searchQuery());
  }

  protected primaryPhone(c: Contact): string {
    return c.phones?.find((p) => p.primary)?.value ?? c.phones?.[0]?.value ?? '';
  }

  protected primaryEmail(c: Contact): string {
    return c.emails?.find((e) => e.primary)?.value ?? c.emails?.[0]?.value ?? '';
  }

  protected visibleTags(c: Contact): { id: string; name: string; color: string }[] {
    return (c.tags ?? []).slice(0, 3);
  }

  protected extraTagCount(c: Contact): number {
    return Math.max(0, (c.tags?.length ?? 0) - 3);
  }

  protected avatarUser(c: Contact) {
    return { displayName: c.name };
  }

  protected pages(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  }
}
