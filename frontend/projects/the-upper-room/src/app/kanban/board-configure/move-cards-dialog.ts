// traces_to: L2-047
import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TarButton, TarSelect } from 'components';

export interface MoveCardsDialogData {
  readonly columnName: string;
  readonly cardCount: number;
  readonly options: readonly { label: string; value: string }[];
}

@Component({
  selector: 'app-move-cards-dialog',
  imports: [MatDialogModule, TarButton, TarSelect],
  templateUrl: './move-cards-dialog.html',
  host: {
    'data-testid': 'config-move-cards-dialog',
  },
})
export class MoveCardsDialog {
  protected readonly data = inject<MoveCardsDialogData>(MAT_DIALOG_DATA);
  private readonly ref = inject<MatDialogRef<MoveCardsDialog, string>>(MatDialogRef);

  protected readonly target = signal<string>(this.data.options[0]?.value ?? '');

  protected confirm(): void {
    const t = this.target();
    if (t) this.ref.close(t);
  }

  protected cancel(): void {
    this.ref.close();
  }
}
