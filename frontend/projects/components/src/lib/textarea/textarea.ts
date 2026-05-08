import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'tar-textarea',
  imports: [MatFormFieldModule, MatInputModule],
  templateUrl: './textarea.html',
  styleUrl: './textarea.scss',
})
export class TarTextarea {
  @Input() label: string | null = null;
  @Input() value = '';
  @Input() placeholder = '';
  @Input() hint: string | null = null;
  @Input() error: string | null = null;
  @Input() ariaLabel: string | null = null;
  @Input() rows = 4;
  @Input() maxLength: number | null = null;
  @Input() required = false;
  @Input() disabled = false;
  @Input() fullWidth = true;
  @Input() testId: string | null = null;
  @Input() errorTestId: string | null = null;

  @Output() readonly valueChange = new EventEmitter<string>();
  @Output() readonly blurred = new EventEmitter<void>();

  protected onInput(event: Event): void {
    this.valueChange.emit((event.target as HTMLTextAreaElement).value);
  }
}
