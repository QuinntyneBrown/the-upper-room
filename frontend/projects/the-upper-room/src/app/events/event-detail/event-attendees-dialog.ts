// traces_to: L2-055
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import type { AttendeeDto } from './event-detail';

export interface EventAttendeesDialogData {
  readonly attendees: readonly AttendeeDto[];
}

@Component({
  selector: 'app-event-attendees-dialog',
  imports: [MatDialogModule],
  templateUrl: './event-attendees-dialog.html',
  styleUrl: './event-attendees-dialog.scss',
  host: {
    'data-testid': 'event-attendees-dialog',
  },
})
export class EventAttendeesDialog {
  protected readonly data = inject<EventAttendeesDialogData>(MAT_DIALOG_DATA);

  protected initials(name: string): string {
    return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  }
}
