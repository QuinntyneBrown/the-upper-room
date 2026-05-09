// traces_to: L2-045
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import type { BoardCard, BoardColumn } from './board-view';

export interface BoardMoveSheetDialogData {
  readonly card: BoardCard;
  readonly options: readonly BoardColumn[];
}

@Component({
  selector: 'app-board-move-sheet-dialog',
  imports: [MatDialogModule],
  template: `
    <h2 mat-dialog-title class="move-sheet__title">Move to...</h2>
    <mat-dialog-content>
      <ul class="move-sheet__options">
        @for (col of data.options; track col.id) {
          <li>
            <button
              [attr.data-testid]="'board-move-sheet-option-' + col.name"
              type="button"
              class="move-sheet__option"
              (click)="choose(col)"
            >
              {{ col.name }}
            </button>
          </li>
        }
      </ul>
    </mat-dialog-content>
  `,
  host: {
    'data-testid': 'board-move-sheet',
    role: 'dialog',
  },
})
export class BoardMoveSheetDialog {
  protected readonly data = inject<BoardMoveSheetDialogData>(MAT_DIALOG_DATA);
  private readonly ref = inject<MatDialogRef<BoardMoveSheetDialog, BoardColumn>>(MatDialogRef);

  protected choose(col: BoardColumn): void {
    this.ref.close(col);
  }
}
