// traces_to: L2-056
import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

export type RecurrenceEditScope = 'single' | 'following' | 'series';

@Component({
  selector: 'app-recurrence-edit-dialog',
  imports: [MatDialogModule],
  template: `
    <h2 mat-dialog-title>Edit recurring event</h2>
    <mat-dialog-content>
      <p>Which events do you want to change?</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button data-testid="recurrence-edit-single" type="button" class="btn-filled" (click)="choose('single')">This event only</button>
      <button data-testid="recurrence-edit-following" type="button" class="btn-tonal" (click)="choose('following')">This and following events</button>
      <button data-testid="recurrence-edit-series" type="button" class="btn-outlined" (click)="choose('series')">Entire series</button>
    </mat-dialog-actions>
  `,
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
