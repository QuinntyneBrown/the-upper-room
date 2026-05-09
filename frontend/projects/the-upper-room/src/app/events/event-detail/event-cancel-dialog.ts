// traces_to: L2-055
import { Component, inject, signal } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-event-cancel-dialog',
  imports: [MatDialogModule],
  templateUrl: './event-cancel-dialog.html',
  styleUrl: './event-cancel-dialog.scss',
  host: {
    'data-testid': 'event-cancel-dialog',
  },
})
export class EventCancelDialog {
  private readonly ref = inject<MatDialogRef<EventCancelDialog, string | null>>(MatDialogRef);

  protected readonly message = signal('');

  protected confirm(): void {
    this.ref.close(this.message() || null);
  }

  protected cancel(): void {
    this.ref.close();
  }
}
