// traces_to: L2-047
import { Component, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmService, TarButton, TarCheckbox, TarSelect, TarTextField } from 'components';
import { MoveCardsDialog, MoveCardsDialogData } from './move-cards-dialog';

export type SchemaFieldType = 'Text' | 'Textarea' | 'Select';

export interface SchemaField {
  readonly key: string;
  readonly label: string;
  readonly type: SchemaFieldType;
  readonly required: boolean;
  readonly options: readonly string[];
}

interface BoardColumn {
  readonly id: string;
  readonly name: string;
  readonly color: string;
  readonly wipLimit?: number;
}

interface BoardCard {
  readonly id: string;
  readonly columnId: string;
  readonly data?: Record<string, string | null>;
}

interface BoardDetail {
  readonly id: string;
  readonly name: string;
  readonly columns: BoardColumn[];
  readonly cards: BoardCard[];
  readonly swimlaneMode?: string;
  readonly schema?: readonly Partial<SchemaField>[];
  readonly cardSchema?: readonly Partial<SchemaField>[];
}

const FIELD_TYPES: readonly SchemaFieldType[] = ['Text', 'Textarea', 'Select'];

function normalizeField(raw: Partial<SchemaField>): SchemaField {
  const rawType = String(raw.type ?? 'Text');
  const type = FIELD_TYPES.find((t) => t.toLowerCase() === rawType.toLowerCase()) ?? 'Text';
  return {
    key: raw.key ?? '',
    label: raw.label ?? '',
    type,
    required: raw.required ?? false,
    options: [...(raw.options ?? [])],
  };
}

@Component({
  selector: 'app-board-configure',
  imports: [TarButton, TarCheckbox, TarSelect, TarTextField],
  templateUrl: './board-configure.html',
  styleUrl: './board-configure.scss',
})
export class BoardConfigure {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly confirm = inject(ConfirmService);

  protected readonly board = signal<BoardDetail | null>(null);
  protected readonly columns = signal<BoardColumn[]>([]);
  protected readonly swimlaneMode = signal<string>('None');
  protected readonly schemaFields = signal<SchemaField[]>([]);
  protected readonly savingSchema = signal(false);

  protected readonly fieldTypeOptions = FIELD_TYPES.map((t) => ({ label: t, value: t }));

  protected readonly swimlaneModeOptions = [
    { label: 'None', value: 'None' },
    { label: 'Assignee', value: 'Assignee' },
    { label: 'Priority', value: 'Priority' },
  ];

  protected readonly cardCountByColumn = computed(() => {
    const counts = new Map<string, number>();
    for (const card of this.board()?.cards ?? []) {
      counts.set(card.columnId, (counts.get(card.columnId) ?? 0) + 1);
    }
    return counts;
  });

  constructor() {
    const boardId = this.route.snapshot.paramMap.get('id') ?? '';
    if (boardId) {
      this.http.get<BoardDetail>(`/api/v1/boards/${boardId}`).subscribe((b) => {
        this.applyBoard(b);
      });
    }
  }

  private applyBoard(b: BoardDetail): void {
    this.board.set(b);
    this.columns.set([...b.columns]);
    this.swimlaneMode.set(b.swimlaneMode ?? 'None');
    this.schemaFields.set((b.schema ?? b.cardSchema ?? []).map(normalizeField));
  }

  // ---- card schema editor (L2-047) ------------------------------------

  protected addField(): void {
    this.schemaFields.update((fields) => [
      ...fields,
      { key: '', label: '', type: 'Text', required: false, options: [] },
    ]);
  }

  protected updateField(index: number, patch: Partial<SchemaField>): void {
    this.schemaFields.update((fields) =>
      fields.map((f, i) => (i === index ? { ...f, ...patch } : f)),
    );
  }

  protected moveField(index: number, delta: -1 | 1): void {
    this.schemaFields.update((fields) => {
      const target = index + delta;
      if (target < 0 || target >= fields.length) return fields;
      const next = [...fields];
      const [moved] = next.splice(index, 1);
      next.splice(target, 0, moved);
      return next;
    });
  }

  protected addOption(index: number): void {
    this.updateField(index, { options: [...(this.schemaFields()[index]?.options ?? []), ''] });
  }

  protected updateOption(index: number, optionIndex: number, value: string): void {
    const options = [...(this.schemaFields()[index]?.options ?? [])];
    options[optionIndex] = value;
    this.updateField(index, { options });
  }

  protected async removeField(index: number): Promise<void> {
    const field = this.schemaFields()[index];
    if (!field) return;
    const affected = this.cardsWithData(field.key);
    if (field.required && affected > 0) {
      const ok = await this.confirm.confirm({
        title: 'Remove field?',
        body: `Removing this field will erase data on ${affected} cards. Continue?`,
        severity: 'danger',
        confirmLabel: 'Remove',
      });
      if (!ok) return;
    }
    this.schemaFields.update((fields) => fields.filter((_, i) => i !== index));
  }

  protected saveSchema(): void {
    const boardId = this.board()?.id;
    if (!boardId) return;
    this.savingSchema.set(true);
    const fields = this.schemaFields().map((f) => ({
      ...f,
      options: f.type === 'Select' ? f.options.filter((o) => o.trim().length > 0) : [],
    }));
    this.http
      .patch<BoardDetail>(`/api/v1/boards/${boardId}/schema`, { fields })
      .subscribe({
        next: (b) => {
          this.savingSchema.set(false);
          if (b && Array.isArray(b.columns)) this.applyBoard(b);
          else this.schemaFields.set(fields);
        },
        error: () => this.savingSchema.set(false),
      });
  }

  private cardsWithData(key: string): number {
    if (!key) return 0;
    return (this.board()?.cards ?? []).filter((c) => {
      const value = c.data?.[key];
      return value !== undefined && value !== null && String(value).length > 0;
    }).length;
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
    const options = this.columns()
      .filter((c) => c.id !== column.id)
      .map((c) => ({ label: c.name, value: c.id }));
    const data: MoveCardsDialogData = { columnName: column.name, cardCount: count, options };
    this.dialog
      .open<MoveCardsDialog, MoveCardsDialogData, string>(MoveCardsDialog, { data })
      .afterClosed()
      .subscribe((targetColumnId) => {
        if (targetColumnId) this.persistDelete(column.id, targetColumnId);
      });
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
