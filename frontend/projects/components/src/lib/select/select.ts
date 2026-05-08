import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

export interface TarSelectOption<T = string> {
  readonly value: T;
  readonly label: string;
  readonly disabled?: boolean;
}

@Component({
  selector: 'tar-select',
  imports: [MatFormFieldModule, MatSelectModule],
  templateUrl: './select.html',
  styleUrl: './select.scss',
})
export class TarSelect<T = string> {
  @Input() label: string | null = null;
  @Input() value: T | null = null;
  @Input() options: readonly TarSelectOption<T>[] = [];
  @Input() placeholder = '';
  @Input() hint: string | null = null;
  @Input() error: string | null = null;
  @Input() ariaLabel: string | null = null;
  @Input() required = false;
  @Input() disabled = false;
  @Input() fullWidth = true;
  @Input() testId: string | null = null;
  @Input() errorTestId: string | null = null;

  @Output() readonly valueChange = new EventEmitter<T>();
}
