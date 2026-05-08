// traces_to: L2-046
import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
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

@Component({
  selector: 'app-card-detail-dialog',
  templateUrl: './card-detail-dialog.html',
  styleUrl: './card-detail-dialog.scss',
})
export class CardDetailDialog implements OnInit {
  @Input({ required: true }) card!: BoardCard;
  @Input() schema: readonly CardSchemaField[] = [];
  @Output() closed = new EventEmitter<void>();
  @Output() patched = new EventEmitter<CardDetailPatch>();

  protected readonly currentTitle = signal('');
  protected readonly currentData = signal<Record<string, string>>({});
  protected readonly fieldErrors = signal<Record<string, string>>({});
  protected readonly comments = signal<string[]>([]);
  protected readonly attachments = signal<string[]>([]);
  protected readonly newComment = signal('');

  ngOnInit(): void {
    this.currentTitle.set(this.card.title);
    const data: Record<string, string> = {};
    for (const [k, v] of Object.entries(this.card.data ?? {})) {
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
    if (!next || next === this.card.title) return;
    this.patched.emit({ id: this.card.id, body: { title: next } });
  }

  protected onClose(): void {
    const errors: Record<string, string> = {};
    for (const field of this.schema) {
      if (field.required && !this.fieldValue(field.key).trim()) {
        errors[field.key] = `${field.label} is required`;
      }
    }
    if (Object.keys(errors).length > 0) {
      this.fieldErrors.set(errors);
      return;
    }
    this.closed.emit();
  }

  protected addComment(): void {
    const text = this.newComment().trim();
    if (!text) return;
    this.comments.update((list) => [...list, text]);
    this.newComment.set('');
  }

  protected onAttach(input: HTMLInputElement): void {
    const file = input.files?.[0];
    if (!file) return;
    this.attachments.update((list) => [...list, file.name]);
    input.value = '';
  }
}
