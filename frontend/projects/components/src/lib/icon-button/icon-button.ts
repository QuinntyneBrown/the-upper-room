import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TarButtonType } from '../button/button';

@Component({
  selector: 'tar-icon-button',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './icon-button.html',
  styleUrl: './icon-button.scss',
})
export class TarIconButton {
  @Input({ required: true }) icon!: string;
  @Input({ required: true }) ariaLabel!: string;
  @Input() type: TarButtonType = 'button';
  @Input() disabled = false;
  @Input() testId: string | null = null;

  @Output() readonly clicked = new EventEmitter<MouseEvent>();
}
