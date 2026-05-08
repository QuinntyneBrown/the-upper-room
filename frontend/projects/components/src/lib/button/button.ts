import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export type TarButtonVariant = 'filled' | 'tonal' | 'outlined' | 'elevated' | 'text';
export type TarButtonColor = 'primary' | 'accent' | 'warn';
export type TarButtonType = 'button' | 'submit' | 'reset';

@Component({
  selector: 'tar-button',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class TarButton {
  @Input() variant: TarButtonVariant = 'filled';
  @Input() color: TarButtonColor = 'primary';
  @Input() type: TarButtonType = 'button';
  @Input() icon: string | null = null;
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;
  @Input() testId: string | null = null;

  @Output() readonly clicked = new EventEmitter<MouseEvent>();
}
