import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatRadioModule } from '@angular/material/radio';

export interface TarRadioOption<T = string> {
  readonly value: T;
  readonly label: string;
  readonly disabled?: boolean;
}

@Component({
  selector: 'tar-radio-group',
  imports: [MatRadioModule],
  templateUrl: './radio-group.html',
  styleUrl: './radio-group.scss',
})
export class TarRadioGroup<T = string> {
  @Input() label: string | null = null;
  @Input() value: T | null = null;
  @Input() options: readonly TarRadioOption<T>[] = [];
  @Input() inline = false;
  @Input() disabled = false;
  @Input() ariaLabel: string | null = null;
  @Input() testId: string | null = null;

  @Output() readonly valueChange = new EventEmitter<T>();
}
