// traces_to: L2-045
import { Component, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

export interface BoardCardTag {
  readonly id: string;
  readonly name: string;
  readonly color: string;
}

export interface BoardCard {
  readonly id: string;
  readonly columnId: string;
  readonly title: string;
  readonly tags: BoardCardTag[];
  readonly assigneeName: string | null;
  readonly dueDate: string | null;
}

export interface BoardColumn {
  readonly id: string;
  readonly name: string;
  readonly color: string;
}

export interface BoardDetail {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly columns: BoardColumn[];
  readonly cards: BoardCard[];
}

@Component({
  selector: 'app-board-view',
  templateUrl: './board-view.html',
  styleUrl: './board-view.scss',
})
export class BoardView {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);

  protected readonly board = signal<BoardDetail | null>(null);
  protected readonly activeTagName = signal<string | null>(null);

  protected readonly tagChips = computed(() => {
    const seen = new Map<string, BoardCardTag>();
    for (const card of this.board()?.cards ?? []) {
      for (const tag of card.tags) {
        if (!seen.has(tag.name)) seen.set(tag.name, tag);
      }
    }
    return [...seen.values()];
  });

  protected readonly visibleCardsByColumn = computed(() => {
    const result = new Map<string, BoardCard[]>();
    const filter = this.activeTagName();
    for (const column of this.board()?.columns ?? []) {
      const cards = (this.board()?.cards ?? [])
        .filter((c) => c.columnId === column.id)
        .filter((c) => !filter || c.tags.some((t) => t.name === filter));
      result.set(column.id, cards);
    }
    return result;
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    if (id) {
      this.http.get<BoardDetail>(`/api/v1/boards/${id}`).subscribe((b) => this.board.set(b));
    }
  }

  protected toggleTag(name: string): void {
    this.activeTagName.update((current) => (current === name ? null : name));
  }

  protected isTagActive(name: string): boolean {
    return this.activeTagName() === name;
  }

  protected cardsFor(columnId: string): BoardCard[] {
    return this.visibleCardsByColumn().get(columnId) ?? [];
  }

  protected visibleTags(card: BoardCard): BoardCardTag[] {
    return card.tags.slice(0, 2);
  }

  protected initials(name: string): string {
    return name
      .split(' ')
      .map((s) => s[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  protected formatDueDate(value: string): string {
    return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  protected onDragStart(event: DragEvent, card: BoardCard): void {
    event.dataTransfer?.setData('text/plain', card.id);
    event.dataTransfer!.effectAllowed = 'move';
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  protected onDrop(event: DragEvent, column: BoardColumn): void {
    event.preventDefault();
    const cardId = event.dataTransfer?.getData('text/plain');
    if (!cardId) return;
    const current = this.board();
    if (!current) return;
    const card = current.cards.find((c) => c.id === cardId);
    if (!card || card.columnId === column.id) return;
    const sourceColumnId = card.columnId;

    this.board.set({
      ...current,
      cards: current.cards.map((c) => (c.id === cardId ? { ...c, columnId: column.id } : c)),
    });

    this.http
      .post(`/api/v1/cards/${cardId}/move`, {
        targetColumnId: column.id,
        sourceColumnId,
      })
      .subscribe();
  }
}
