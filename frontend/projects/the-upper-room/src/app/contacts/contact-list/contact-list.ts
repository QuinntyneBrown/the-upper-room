// traces_to: L2-029, L2-030
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PermissionsService } from '../../rbac/permissions.service';
import { TarEmptyState } from '../../../../../components/src/lib/states/tar-empty-state';
import { TarAvatar } from '../../../../../components/src/lib/avatar/tar-avatar';

export interface ContactPhone {
  readonly value: string;
  readonly primary: boolean;
}

export interface ContactEmail {
  readonly value: string;
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

@Component({
  selector: 'app-contact-list',
  imports: [TarEmptyState, TarAvatar],
  templateUrl: './contact-list.html',
  styleUrl: './contact-list.scss',
})
export class ContactList implements OnInit, OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly perms = inject(PermissionsService);
  private readonly destroy$ = new Subject<void>();
  private readonly search$ = new Subject<string>();

  protected readonly contacts = signal<Contact[]>([]);
  protected readonly searchQuery = signal('');
  protected readonly showArchived = signal(false);
  protected readonly canCreate = computed(() => this.perms.hasPermission('Contact:Create'));
  protected readonly isEmpty = computed(() => this.contacts().length === 0);

  ngOnInit(): void {
    this.load();
    this.search$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((q) => {
          const params = new URLSearchParams();
          if (q) params.set('search', q);
          if (this.showArchived()) params.set('archived', 'true');
          return this.http.get<{ items: Contact[]; total: number }>(
            `/api/v1/contacts?${params.toString()}`,
          );
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((r) => this.contacts.set(r.items));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private load(): void {
    this.http
      .get<{ items: Contact[]; total: number }>('/api/v1/contacts')
      .pipe(takeUntil(this.destroy$))
      .subscribe((r) => this.contacts.set(r.items));
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
}
