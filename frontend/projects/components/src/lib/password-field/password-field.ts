import { Component, EventEmitter, Output, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'tar-password-field',
  imports: [MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule],
  templateUrl: './password-field.html',
  styleUrl: './password-field.scss',
})
export class TarPasswordField {
  readonly label = input<string | null>('Password');
  readonly value = input('');
  readonly placeholder = input('');
  readonly hint = input<string | null>(null);
  readonly error = input<string | null>(null);
  readonly ariaLabel = input<string | null>(null);
  readonly autocomplete = input('current-password');
  readonly maxLength = input<number | null>(null);
  readonly required = input(false);
  readonly disabled = input(false);
  readonly fullWidth = input(true);
  readonly testId = input<string | null>(null);
  readonly errorTestId = input<string | null>(null);
  readonly toggleTestId = input<string | null>(null);

  @Output() readonly valueChange = new EventEmitter<string>();
  @Output() readonly blurred = new EventEmitter<void>();

  protected readonly visible = signal(false);

  protected toggle(): void {
    this.visible.update((v) => !v);
  }

  protected onInput(event: Event): void {
    this.valueChange.emit((event.target as HTMLInputElement).value);
  }
}
