// traces_to: L2-040
import { Component, EventEmitter, Input, OnDestroy, Output, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, debounceTime, switchMap, of } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PERMISSIONS_SERVICE } from '../../rbac/permissions.contract';
import type { Tag } from '../tag.model';

@Component({
  selector: 'tar-tag-selector',
  templateUrl: './tar-tag-selector.html',
  styleUrl: './tar-tag-selector.scss',
})
export class TarTagSelector implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly perms = inject(PERMISSIONS_SERVICE);
  private readonly destroy$ = new Subject<void>();
  private readonly search$ = new Subject<string>();

  @Input() tags: Tag[] = [];
  @Output() readonly tagsChange = new EventEmitter<Tag[]>();

  protected readonly searchText = signal('');
  protected readonly suggestions = signal<Tag[]>([]);
  protected readonly canCreate = computed(() => this.perms.hasPermission('Tag:Create'));

  constructor() {
    this.search$
      .pipe(
        debounceTime(200),
        switchMap((q) =>
          q.length > 0
            ? this.http.get<{ items: Tag[] }>(`/api/v1/tags?search=${encodeURIComponent(q)}`)
            : of({ items: [] }),
        ),
        takeUntil(this.destroy$),
      )
      .subscribe((r) => this.suggestions.set(r.items));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected onInput(value: string): void {
    this.searchText.set(value);
    this.search$.next(value);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter') return;
    const text = this.searchText().trim();
    if (!text) return;
    event.preventDefault();
    const match = this.suggestions().find((t) => t.name.toLowerCase() === text.toLowerCase());
    if (match) {
      this.addTag(match);
      return;
    }
    if (this.canCreate()) {
      this.http.post<Tag>('/api/v1/tags', { name: text, color: 'blue' }).subscribe((tag) =>
        this.addTag(tag),
      );
    }
  }

  protected addTag(tag: Tag): void {
    if (this.tags.some((t) => t.id === tag.id)) return;
    this.tagsChange.emit([...this.tags, tag]);
    this.searchText.set('');
    this.suggestions.set([]);
  }

  protected removeTag(tag: Tag): void {
    this.tagsChange.emit(this.tags.filter((t) => t.id !== tag.id));
  }

  protected get showCreateHint(): boolean {
    const text = this.searchText().trim();
    return (
      this.canCreate() &&
      text.length > 0 &&
      !this.suggestions().some((s) => s.name.toLowerCase() === text.toLowerCase())
    );
  }
}
