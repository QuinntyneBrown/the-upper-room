// traces_to: L2-046
import { Component, OnInit, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ConfirmService, TarButton, TarIconButton, TarTextarea, TarTextField } from 'components';
import { BoardCard } from '../board-view/board-view';

export interface CardSchemaField {
  readonly key: string;
  readonly label: string;
  readonly type: 'text';
  readonly required: boolean;
}

export interface CardDetailPatch {
  readonly id: string;
  readonly body: Record<string, unknown>;
}

export interface CardDetailDialogData {
  readonly card: BoardCard;
  readonly schema: readonly CardSchemaField[];
  readonly onPatch: (patch: CardDetailPatch) => void;
}

export type CardDetailDialogResult =
  | { kind: 'close' }
  | { kind: 'archive' }
  | { kind: 'delete' };

@Component({
  selector: 'app-card-detail-dialog',
  imports: [MatDialogModule, TarButton, TarIconButton, TarTextarea, TarTextField],
  templateUrl: './card-detail-dialog.html',
  styleUrl: './card-detail-dialog.scss',
  host: {
    'data-testid': 'card-detail-dialog',
  },
})
export class CardDetailDialog implements OnInit {
  protected readonly data = inject<CardDetailDialogData>(MAT_DIALOG_DATA);
  private readonly ref = inject<MatDialogRef<CardDetailDialog, CardDetailDialogResult>>(MatDialogRef);
  private readonly confirm = inject(ConfirmService);

  protected readonly currentTitle = signal('');
  protected readonly currentData = signal<Record<string, string>>({});
  protected readonly fieldErrors = signal<Record<string, string>>({});
  protected readonly comments = signal<string[]>([]);
  protected readonly attachments = signal<string[]>([]);
  protected readonly newComment = signal('');

  ngOnInit(): void {
    this.currentTitle.set(this.data.card.title);
    const data: Record<string, string> = {};
    for (const [k, v] of Object.entries(this.data.card.data ?? {})) {
      data[k] = v ?? '';
    }
    this.currentData.set(data);
  }

  protected fieldValue(key: string): string {
    return this.currentData()[key] ?? '';
  }

  protected onFieldInput(key: string, value: string): void {
    this.currentData.update((d) => ({ ...d, [key]: value }));
    this.fieldErrors.update((e) => {
      const next = { ...e };
      delete next[key];
      return next;
    });
  }

  protected onTitleBlur(): void {
    const next = this.currentTitle().trim();
    if (!next || next === this.data.card.title) return;
    this.data.onPatch({ id: this.data.card.id, body: { title: next } });
  }

  protected onClose(): void {
    const errors: Record<string, string> = {};
    for (const field of this.data.schema) {
      if (field.required && !this.fieldValue(field.key).trim()) {
        errors[field.key] = `${field.label} is required`;
      }
    }
    if (Object.keys(errors).length > 0) {
      this.fieldErrors.set(errors);
      return;
    }
    this.ref.close({ kind: 'close' });
  }

  protected addComment(): void {
    const text = this.newComment().trim();
    if (!text) return;
    this.comments.update((list) => [...list, text]);
    this.newComment.set('');
  }

  protected onArchive(): void {
    this.ref.close({ kind: 'archive' });
  }

  protected async onDelete(): Promise<void> {
    const ok = await this.confirm.confirm({
      severity: 'danger',
      title: 'Delete card?',
      body: 'This will permanently remove the card.',
      requireTypedConfirmation: this.data.card.title,
      confirmLabel: 'Delete',
    });
    if (ok) this.ref.close({ kind: 'delete' });
  }

  protected onAttach(input: HTMLInputElement): void {
    const file = input.files?.[0];
    if (!file) return;
    this.attachments.update((list) => [...list, file.name]);
    input.value = '';
  }
}
