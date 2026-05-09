// traces_to: L2-038, L2-039
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  ConfirmService,
  SnackbarService,
  TarButton,
  TarSelect,
  TarSelectOption,
  TarTextField,
} from 'components';
import type { Tag } from 'domain';

export const COLORS = [
  'red', 'pink', 'purple', 'indigo', 'blue',
  'cyan', 'teal', 'green', 'lime', 'yellow', 'orange', 'amber',
] as const;

@Component({
  selector: 'app-tag-list',
  imports: [TarTextField, TarSelect, TarButton],
  templateUrl: './tag-list.html',
  styleUrl: './tag-list.scss',
})
export class TagList implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly confirm = inject(ConfirmService);
  private readonly snackbar = inject(SnackbarService);

  protected readonly tags = signal<Tag[]>([]);
  protected readonly name = signal('');
  protected readonly color = signal<string>(COLORS[0]);
  protected readonly nameError = signal<string | null>(null);
  protected readonly editingId = signal<string | null>(null);
  protected readonly editColor = signal('');
  protected readonly colorOptions: readonly TarSelectOption<string>[] = COLORS.map((c) => ({
    value: c,
    label: c,
  }));

  protected readonly groupedTags = computed(() => {
    const map = new Map<string, Tag[]>();
    for (const tag of this.tags()) {
      const list = map.get(tag.color) ?? [];
      list.push(tag);
      map.set(tag.color, list);
    }
    return Array.from(map.entries()).map(([color, tags]) => ({ color, tags }));
  });

  ngOnInit(): void {
    this.http.get<{ items: Tag[] }>('/api/v1/tags').subscribe((r) => this.tags.set(r.items));
  }

  protected onCreate(event: Event): void {
    event.preventDefault();
    this.nameError.set(null);
    this.http.post<Tag>('/api/v1/tags', { name: this.name(), color: this.color() }).subscribe({
      next: (tag) => {
        this.tags.update((list) => [...list, tag]);
        this.name.set('');
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 409) this.nameError.set('A tag with this name already exists.');
      },
    });
  }

  protected onEdit(tag: Tag): void {
    this.editingId.set(tag.id);
    this.editColor.set(tag.color);
  }

  protected onSaveEdit(tag: Tag): void {
    this.http.patch<Tag>(`/api/v1/tags/${tag.id}`, { color: this.editColor() }).subscribe({
      next: (updated) => {
        this.tags.update((list) => list.map((t) => (t.id === updated.id ? updated : t)));
        this.editingId.set(null);
      },
    });
  }

  protected async onDelete(tag: Tag): Promise<void> {
    const ok = await this.confirm.confirm({
      title: `Delete "${tag.name}"?`,
      body: 'Tag associations will be removed. Tagged items remain.',
      severity: 'danger',
      confirmLabel: 'Delete',
    });
    if (!ok) return;
    this.http.delete(`/api/v1/tags/${tag.id}`).subscribe({
      next: () => {
        this.tags.update((list) => list.filter((t) => t.id !== tag.id));
        this.snackbar.show(`"${tag.name}" deleted`, 'info');
      },
    });
  }
}
