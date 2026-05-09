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
  template: `
    <h2 mat-dialog-title>Attendees</h2>
    <mat-dialog-content>
      <div class="event-dialog__list">
        @for (a of data.attendees; track a.id) {
          <div [attr.data-testid]="'attendee-list-' + a.id" class="event-dialog__attendee">
            <div class="attendee-avatar attendee-avatar--sm">
              @if (a.avatarUrl) {
                <img [src]="a.avatarUrl" [alt]="a.name" />
              } @else {
                <span>{{ initials(a.name) }}</span>
              }
            </div>
            <div>
              <p class="event-dialog__attendee-name">{{ a.name }}</p>
              <p class="event-dialog__attendee-status">{{ a.rsvpStatus }}</p>
            </div>
          </div>
        }
      </div>
    </mat-dialog-content>
  `,
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
