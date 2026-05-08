import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TarButtonColor, TarButtonType } from '../button/button';

@Component({
  selector: 'tar-fab',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './fab.html',
  styleUrl: './fab.scss',
})
export class TarFab {
  @Input({ required: true }) icon!: string;
  @Input({ required: true }) ariaLabel!: string;
  @Input() extended = false;
  @Input() color: TarButtonColor = 'primary';
  @Input() type: TarButtonType = 'button';
  @Input() disabled = false;
  @Input() testId: string | null = null;

  @Output() readonly clicked = new EventEmitter<MouseEvent>();
}
