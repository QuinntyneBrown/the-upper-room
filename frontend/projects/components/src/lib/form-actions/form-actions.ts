import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export type TarFormActionsAlign = 'end' | 'start' | 'space-between';

@Component({
  selector: 'tar-form-actions',
  imports: [MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './form-actions.html',
  styleUrl: './form-actions.scss',
})
export class TarFormActions {
  @Input() saveLabel = 'Save';
  @Input() cancelLabel: string | null = 'Cancel';
  @Input() saveType: 'button' | 'submit' = 'submit';
  @Input() dirty = true;
  @Input() saving = false;
  @Input() disabled = false;
  @Input() sticky = false;
  @Input() align: TarFormActionsAlign = 'end';
  @Input() saveTestId: string | null = null;
  @Input() cancelTestId: string | null = null;

  @Output() readonly saved = new EventEmitter<void>();
  @Output() readonly cancelled = new EventEmitter<void>();
}
