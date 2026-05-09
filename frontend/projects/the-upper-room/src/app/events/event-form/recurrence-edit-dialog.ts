// traces_to: L2-056
import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

export type RecurrenceEditScope = 'single' | 'following' | 'series';

@Component({
  selector: 'app-recurrence-edit-dialog',
  imports: [MatDialogModule],
  templateUrl: './recurrence-edit-dialog.html',
  styleUrl: './recurrence-edit-dialog.scss',
  host: {
    'data-testid': 'recurrence-edit-dialog',
  },
})
export class RecurrenceEditDialog {
  private readonly ref = inject<MatDialogRef<RecurrenceEditDialog, RecurrenceEditScope>>(MatDialogRef);

  protected choose(scope: RecurrenceEditScope): void {
    this.ref.close(scope);
  }
}
