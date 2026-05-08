import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';

export interface TarChipOption<T = string> {
  readonly value: T;
  readonly label: string;
  readonly disabled?: boolean;
}

@Component({
  selector: 'tar-chip-set',
  imports: [MatChipsModule],
  templateUrl: './chip-set.html',
  styleUrl: './chip-set.scss',
})
export class TarChipSet<T = string> {
  @Input() single = false;
  @Input() value: T | null = null;
  @Input() options: readonly TarChipOption<T>[] = [];
  @Input() ariaLabel: string | null = null;
  @Input() testId: string | null = null;

  @Output() readonly valueChange = new EventEmitter<T>();
}
