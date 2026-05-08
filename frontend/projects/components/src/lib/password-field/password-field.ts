import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
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
  @Input() label: string | null = 'Password';
  @Input() value = '';
  @Input() placeholder = '';
  @Input() hint: string | null = null;
  @Input() error: string | null = null;
  @Input() ariaLabel: string | null = null;
  @Input() autocomplete = 'current-password';
  @Input() maxLength: number | null = null;
  @Input() required = false;
  @Input() disabled = false;
  @Input() fullWidth = true;
  @Input() testId: string | null = null;
  @Input() errorTestId: string | null = null;
  @Input() toggleTestId: string | null = null;

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
