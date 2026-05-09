// traces_to: L2-045
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { SnackbarService, optimisticMutation } from 'components';
import {
  CardDetailDialog,
  CardDetailDialogData,
  CardDetailDialogResult,
  CardDetailPatch,
  CardSchemaField,
} from '../card-detail-dialog/card-detail-dialog';
import { BoardMoveSheetDialog, BoardMoveSheetDialogData } from './board-move-sheet-dialog';

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
  readonly archived?: boolean;
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
  imports: [],
  templateUrl: './board-view.html',
  styleUrl: './board-view.scss',
})
export class BoardView implements AfterViewInit, OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly snackbar = inject(SnackbarService);
  private readonly dialog = inject(MatDialog);

  @ViewChild('columnsEl') readonly columnsEl?: ElementRef<HTMLElement>;

  protected readonly board = signal<BoardDetail | null>(null);
  protected readonly activeTagName = signal<string | null>(null);
  protected readonly activeColumnIndex = signal(0);
  protected readonly showArchived = signal(false);

  private readonly scrollListener = () => this.onColumnsScroll();
  private touchStartX = 0;
  private touchStartY = 0;

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
    const showArchived = this.showArchived();
    for (const column of this.board()?.columns ?? []) {
      const cards = (this.board()?.cards ?? [])
        .filter((c) => c.columnId === column.id)
        .filter((c) => showArchived || !c.archived)
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

  ngAfterViewInit(): void {
    this.columnsEl?.nativeElement.addEventListener('scroll', this.scrollListener, { passive: true });
  }

  ngOnDestroy(): void {
    this.columnsEl?.nativeElement.removeEventListener('scroll', this.scrollListener);
  }

  private onColumnsScroll(): void {
    const el = this.columnsEl?.nativeElement;
    if (!el || el.clientWidth === 0) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    this.activeColumnIndex.set(index);
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
    const showArchived = this.showArchived();
    return (this.board()?.cards ?? [])
      .filter((c) => c.columnId === columnId && c.swimlaneKey === laneKey)
      .filter((c) => showArchived || !c.archived)
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

    const next = {
      ...current,
      cards: current.cards.map((c) =>
        c.id === cardId ? { ...c, columnId: column.id, swimlaneKey: targetSwimlaneKey ?? c.swimlaneKey } : c
      ),
    };

    const body: Record<string, string | undefined> = { targetColumnId: column.id, sourceColumnId };
    if (targetSwimlaneKey !== undefined) body['targetSwimlaneKey'] = targetSwimlaneKey;

    optimisticMutation(
      this.board,
      next,
      () => this.http.post(`/api/v1/cards/${cardId}/move`, body),
      () => this.snackbar.show("Couldn't save. Try again.", 'error'),
    );
  }

  protected cardCount(columnId: string): number {
    return (this.board()?.cards ?? []).filter((c) => c.columnId === columnId).length;
  }

  protected isOverLimit(column: BoardColumn): boolean {
    return column.wipLimit != null && this.cardCount(column.id) >= column.wipLimit;
  }

  protected onCardTouchStart(event: TouchEvent, card: BoardCard): void {
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
  }

  protected onCardTouchMove(event: TouchEvent, card: BoardCard): void {
    const dx = Math.abs(event.touches[0].clientX - this.touchStartX);
    const dy = Math.abs(event.touches[0].clientY - this.touchStartY);
    if (dx > 10 || dy > 10) {
      event.preventDefault();
      this.openMoveSheet(card);
    }
  }

  protected onCardPointerDown(event: PointerEvent, card: BoardCard): void {
    if (event.pointerType === 'touch') {
      this.touchStartX = event.clientX;
      this.touchStartY = event.clientY;
    }
  }

  protected onCardPointerMove(event: PointerEvent, card: BoardCard): void {
    if (event.pointerType !== 'touch' || !event.buttons) return;
    const dx = Math.abs(event.clientX - this.touchStartX);
    const dy = Math.abs(event.clientY - this.touchStartY);
    if (dx > 12 || dy > 12) {
      event.preventDefault();
      this.openMoveSheet(card);
    }
  }

  private openMoveSheet(card: BoardCard): void {
    const options = (this.board()?.columns ?? []).filter((c) => c.id !== card.columnId);
    const data: BoardMoveSheetDialogData = { card, options };
    this.dialog
      .open<BoardMoveSheetDialog, BoardMoveSheetDialogData, BoardColumn>(BoardMoveSheetDialog, { data })
      .afterClosed()
      .subscribe((targetColumn) => {
        if (targetColumn) this.moveCardToColumn(card, targetColumn);
      });
  }

  private moveCardToColumn(card: BoardCard, targetColumn: BoardColumn): void {
    const current = this.board();
    if (!current || card.columnId === targetColumn.id) return;
    const sourceColumnId = card.columnId;
    const next = {
      ...current,
      cards: current.cards.map((c) => (c.id === card.id ? { ...c, columnId: targetColumn.id } : c)),
    };
    optimisticMutation(
      this.board,
      next,
      () => this.http.post(`/api/v1/cards/${card.id}/move`, { targetColumnId: targetColumn.id, sourceColumnId }),
      () => this.snackbar.show("Couldn't save. Try again.", 'error'),
    );
  }

  protected openCard(card: BoardCard): void {
    const data: CardDetailDialogData = {
      card,
      schema: this.cardSchema(),
      onPatch: (patch) => this.applyCardPatch(patch),
    };
    this.dialog
      .open<CardDetailDialog, CardDetailDialogData, CardDetailDialogResult>(CardDetailDialog, { data })
      .afterClosed()
      .subscribe((result) => {
        const target = this.board()?.cards.find((c) => c.id === card.id) ?? card;
        if (result?.kind === 'archive') this.archiveCard(target);
        else if (result?.kind === 'delete') this.deleteCard(target);
      });
  }

  private applyCardPatch(patch: CardDetailPatch): void {
    const current = this.board();
    if (!current) return;
    this.board.set({
      ...current,
      cards: current.cards.map((c) => (c.id === patch.id ? { ...c, ...patch.body } : c)),
    });
    this.http.patch(`/api/v1/cards/${patch.id}`, patch.body).subscribe();
  }

  private archiveCard(card: BoardCard): void {
    const current = this.board();
    if (!current) return;
    this.board.set({
      ...current,
      cards: current.cards.map((c) => (c.id === card.id ? { ...c, archived: true } : c)),
    });
    this.http.patch(`/api/v1/cards/${card.id}`, { archived: true }).subscribe();
  }

  private deleteCard(card: BoardCard): void {
    const current = this.board();
    if (!current) return;
    this.board.set({
      ...current,
      cards: current.cards.filter((c) => c.id !== card.id),
    });
    this.http.delete(`/api/v1/cards/${card.id}`).subscribe();
    this.snackbar.show('Card deleted', 'info');
  }
}
