// traces_to: L2-055
import { Component, inject, signal } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-event-cancel-dialog',
  imports: [MatDialogModule],
  template: `
    <h2 mat-dialog-title>Cancel event</h2>
    <mat-dialog-content>
      <div class="form-field">
        <label class="form-field__label" for="cancel-msg">Message to attendees (optional)</label>
        <textarea
          data-testid="event-cancel-message"
          id="cancel-msg"
          class="form-field__textarea"
          rows="3"
          [value]="message()"
          (input)="message.set($any($event.target).value)"
          placeholder="Let attendees know why…"
        ></textarea>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button type="button" class="btn-outlined" (click)="cancel()">Keep event</button>
      <button
        data-testid="event-cancel-confirm"
        type="button"
        class="btn-filled"
        style="background: var(--md-sys-color-error); color: var(--md-sys-color-on-error)"
        (click)="confirm()"
      >Yes, cancel</button>
    </mat-dialog-actions>
  `,
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
