import { Component, EventEmitter, Input, Output } from '@angular/core';
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
  @Input() label: string | null = null;
  @Input() value: string | number | null = '';
  @Input() type: TarTextFieldType = 'text';
  @Input() placeholder = '';
  @Input() hint: string | null = null;
  @Input() error: string | null = null;
  @Input() ariaLabel: string | null = null;
  @Input() autocomplete: string | null = null;
  @Input() inputmode: string | null = null;
  @Input() maxLength: number | null = null;
  @Input() prefixIcon: string | null = null;
  @Input() suffixIcon: string | null = null;
  @Input() appearance: TarFieldAppearance = 'outline';
  @Input() required = false;
  @Input() readonly = false;
  @Input() disabled = false;
  @Input() fullWidth = true;
  @Input() hideRequiredMarker = false;
  @Input() testId: string | null = null;
  @Input() errorTestId: string | null = null;
  @Input() hintTestId: string | null = null;

  @Output() readonly valueChange = new EventEmitter<string>();
  @Output() readonly blurred = new EventEmitter<void>();

  protected onInput(event: Event): void {
    const next = (event.target as HTMLInputElement).value;
    this.valueChange.emit(next);
  }
}
