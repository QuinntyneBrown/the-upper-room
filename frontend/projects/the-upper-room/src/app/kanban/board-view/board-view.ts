// traces_to: L2-045
import { Component, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { SnackbarService } from 'components';
import { CardDetailDialog, CardSchemaField, CardDetailPatch } from '../card-detail-dialog/card-detail-dialog';

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
  readonly swimlaneKey: string | null;
  readonly data?: Record<string, string | null>;
}

export interface BoardColumn {
  readonly id: string;
  readonly name: string;
  readonly color: string;
  readonly wipLimit?: number;
}

export interface BoardDetail {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly columns: BoardColumn[];
  readonly cards: BoardCard[];
  readonly cardSchema?: CardSchemaField[];
  readonly swimlaneMode?: 'None' | 'Assignee' | 'Priority';
}

@Component({
  selector: 'app-board-view',
  imports: [CardDetailDialog],
  templateUrl: './board-view.html',
  styleUrl: './board-view.scss',
})
export class BoardView {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly snackbar = inject(SnackbarService);

  protected readonly board = signal<BoardDetail | null>(null);
  protected readonly activeTagName = signal<string | null>(null);
  protected readonly selectedCardId = signal<string | null>(null);

  protected readonly selectedCard = computed(() => {
    const id = this.selectedCardId();
    return id ? (this.board()?.cards.find((c) => c.id === id) ?? null) : null;
  });

  protected readonly cardSchema = computed(() => this.board()?.cardSchema ?? []);

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

  protected readonly swimlaneMode = computed(() => this.board()?.swimlaneMode ?? 'None');

  protected readonly swimlanes = computed<string[]>(() => {
    if (this.swimlaneMode() === 'None') return [];
    const seen = new Set<string>();
    for (const card of this.board()?.cards ?? []) seen.add(card.swimlaneKey ?? '');
    return [...seen].sort();
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

  protected cardsForLane(columnId: string, laneKey: string): BoardCard[] {
    const filter = this.activeTagName();
    return (this.board()?.cards ?? [])
      .filter((c) => c.columnId === columnId && c.swimlaneKey === laneKey)
      .filter((c) => !filter || c.tags.some((t) => t.name === filter));
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

  protected onDrop(event: DragEvent, column: BoardColumn, targetSwimlaneKey?: string): void {
    event.preventDefault();
    const cardId = event.dataTransfer?.getData('text/plain');
    if (!cardId) return;
    const current = this.board();
    if (!current) return;
    const card = current.cards.find((c) => c.id === cardId);
    if (!card) return;
    const sameColumn = card.columnId === column.id;
    const sameLane = targetSwimlaneKey === undefined || card.swimlaneKey === targetSwimlaneKey;
    if (sameColumn && sameLane) return;
    if (this.isOverLimit(column)) {
      this.snackbar.show(`WIP limit reached for ${column.name}`, 'error');
      return;
    }
    const sourceColumnId = card.columnId;

    this.board.set({
      ...current,
      cards: current.cards.map((c) =>
        c.id === cardId ? { ...c, columnId: column.id, swimlaneKey: targetSwimlaneKey ?? c.swimlaneKey } : c
      ),
    });

    const body: Record<string, string | undefined> = { targetColumnId: column.id, sourceColumnId };
    if (targetSwimlaneKey !== undefined) body['targetSwimlaneKey'] = targetSwimlaneKey;
    this.http.post(`/api/v1/cards/${cardId}/move`, body).subscribe();
  }

  protected cardCount(columnId: string): number {
    return (this.board()?.cards ?? []).filter((c) => c.columnId === columnId).length;
  }

  protected isOverLimit(column: BoardColumn): boolean {
    return column.wipLimit !== undefined && this.cardCount(column.id) >= column.wipLimit;
  }

  protected openCard(card: BoardCard): void {
    this.selectedCardId.set(card.id);
  }

  protected closeCard(): void {
    this.selectedCardId.set(null);
  }

  protected onCardPatched(patch: CardDetailPatch): void {
    const current = this.board();
    if (!current) return;
    this.board.set({
      ...current,
      cards: current.cards.map((c) => (c.id === patch.id ? { ...c, ...patch.body } : c)),
    });
    this.http.patch(`/api/v1/cards/${patch.id}`, patch.body).subscribe();
  }
}
