// traces_to: L2-047
import { Component, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

interface BoardColumn {
  readonly id: string;
  readonly name: string;
  readonly color: string;
  readonly wipLimit?: number;
}

interface BoardCard {
  readonly id: string;
  readonly columnId: string;
}

interface BoardDetail {
  readonly id: string;
  readonly name: string;
  readonly columns: BoardColumn[];
  readonly cards: BoardCard[];
  readonly swimlaneMode?: string;
}

@Component({
  selector: 'app-board-configure',
  templateUrl: './board-configure.html',
  styleUrl: './board-configure.scss',
})
export class BoardConfigure {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);

  protected readonly board = signal<BoardDetail | null>(null);
  protected readonly columns = signal<BoardColumn[]>([]);
  protected readonly deleteTarget = signal<BoardColumn | null>(null);
  protected readonly moveCardsTo = signal<string>('');
  protected readonly swimlaneMode = signal<string>('None');

  protected readonly cardCountByColumn = computed(() => {
    const counts = new Map<string, number>();
    for (const card of this.board()?.cards ?? []) {
      counts.set(card.columnId, (counts.get(card.columnId) ?? 0) + 1);
    }
    return counts;
  });

  protected readonly otherColumns = computed(() =>
    this.columns().filter((c) => c.id !== this.deleteTarget()?.id),
  );

  protected readonly cardsInDeleteTarget = computed(() => {
    const target = this.deleteTarget();
    if (!target) return 0;
    return this.cardCountByColumn().get(target.id) ?? 0;
  });

  constructor() {
    const boardId = this.route.snapshot.paramMap.get('id') ?? '';
    if (boardId) {
      this.http.get<BoardDetail>(`/api/v1/boards/${boardId}`).subscribe((b) => {
        this.board.set(b);
        this.columns.set([...b.columns]);
        this.swimlaneMode.set(b.swimlaneMode ?? 'None');
      });
    }
  }

  protected onDragStart(event: DragEvent, column: BoardColumn): void {
    event.dataTransfer?.setData('text/plain', column.id);
    event.dataTransfer!.effectAllowed = 'move';
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  protected onDrop(event: DragEvent, target: BoardColumn): void {
    event.preventDefault();
    const sourceId = event.dataTransfer?.getData('text/plain');
    if (!sourceId || sourceId === target.id) return;
    const current = [...this.columns()];
    const sourceIdx = current.findIndex((c) => c.id === sourceId);
    const targetIdx = current.findIndex((c) => c.id === target.id);
    if (sourceIdx < 0 || targetIdx < 0) return;
    const [moved] = current.splice(sourceIdx, 1);
    current.splice(targetIdx, 0, moved);
    this.columns.set(current);
    this.persistOrder(current.map((c) => c.id));
  }

  protected onDeleteColumn(column: BoardColumn): void {
    const count = this.cardCountByColumn().get(column.id) ?? 0;
    if (count === 0) {
      this.persistDelete(column.id);
      return;
    }
    this.deleteTarget.set(column);
    this.moveCardsTo.set(this.otherColumns()[0]?.id ?? '');
  }

  protected confirmMove(): void {
    const target = this.deleteTarget();
    const targetColumnId = this.moveCardsTo();
    if (!target || !targetColumnId) return;
    this.persistDelete(target.id, targetColumnId);
    this.deleteTarget.set(null);
  }

  protected cancelMove(): void {
    this.deleteTarget.set(null);
  }

  protected onSwimlaneChange(mode: string): void {
    this.swimlaneMode.set(mode);
    const boardId = this.board()?.id;
    if (boardId) this.http.patch(`/api/v1/boards/${boardId}`, { swimlaneMode: mode }).subscribe();
  }

  private persistOrder(order: string[]): void {
    const boardId = this.board()?.id;
    if (!boardId) return;
    this.http.post(`/api/v1/boards/${boardId}/columns/order`, { order }).subscribe();
  }

  private persistDelete(columnId: string, targetColumnId?: string): void {
    const boardId = this.board()?.id;
    if (!boardId) return;
    const url = `/api/v1/boards/${boardId}/columns/${columnId}`;
    const body = targetColumnId ? { targetColumnId } : {};
    this.http.request('DELETE', url, { body }).subscribe(() => {
      this.columns.update((cols) => cols.filter((c) => c.id !== columnId));
    });
  }
}
