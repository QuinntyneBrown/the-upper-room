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
  templateUrl: './board-move-sheet-dialog.html',
  styleUrl: './board-move-sheet-dialog.scss',
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
