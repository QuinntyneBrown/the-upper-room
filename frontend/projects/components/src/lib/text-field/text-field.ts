import { Component, EventEmitter, Output, input } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

export type TarFieldAppearance = 'fill' | 'outline';
export type TarTextFieldType = 'text' | 'email' | 'tel' | 'url' | 'number' | 'search';

@Component({
  selector: 'tar-text-field',
  imports: [MatFormFieldModule, MatInputModule, MatIconModule],
  templateUrl: './text-field.html',
  styleUrl: './text-field.scss',
})
export class TarTextField {
  readonly label = input<string | null>(null);
  readonly value = input<string | number | null>('');
  readonly type = input<TarTextFieldType>('text');
  readonly placeholder = input('');
  readonly hint = input<string | null>(null);
  readonly error = input<string | null>(null);
  readonly ariaLabel = input<string | null>(null);
  readonly autocomplete = input<string | null>(null);
  readonly inputmode = input<string | null>(null);
  readonly maxLength = input<number | null>(null);
  readonly prefixIcon = input<string | null>(null);
  readonly suffixIcon = input<string | null>(null);
  readonly appearance = input<TarFieldAppearance>('outline');
  readonly required = input(false);
  readonly readonly = input(false);
  readonly disabled = input(false);
  readonly fullWidth = input(true);
  readonly hideRequiredMarker = input(false);
  readonly testId = input<string | null>(null);
  readonly errorTestId = input<string | null>(null);
  readonly hintTestId = input<string | null>(null);

  @Output() readonly valueChange = new EventEmitter<string>();
  @Output() readonly blurred = new EventEmitter<void>();

  protected onInput(event: Event): void {
    const next = (event.target as HTMLInputElement).value;
    this.valueChange.emit(next);
  }
}
