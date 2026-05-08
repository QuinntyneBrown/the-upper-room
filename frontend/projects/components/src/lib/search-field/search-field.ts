import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'tar-search-field',
  imports: [MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule],
  templateUrl: './search-field.html',
  styleUrl: './search-field.scss',
})
export class TarSearchField {
  @Input() label: string | null = null;
  @Input() value = '';
  @Input() placeholder = 'Search';
  @Input() ariaLabel: string | null = null;
  @Input() disabled = false;
  @Input() testId: string | null = null;

  @Output() readonly valueChange = new EventEmitter<string>();
  @Output() readonly cleared = new EventEmitter<void>();

  protected onInput(event: Event): void {
    this.valueChange.emit((event.target as HTMLInputElement).value);
  }

  protected onClear(): void {
    this.valueChange.emit('');
    this.cleared.emit();
  }
}
