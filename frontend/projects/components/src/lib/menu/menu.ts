import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

export interface TarMenuItem {
  readonly id: string;
  readonly label: string;
  readonly icon?: string;
  readonly disabled?: boolean;
  readonly danger?: boolean;
  readonly divider?: boolean;
}

@Component({
  selector: 'tar-menu',
  imports: [MatMenuModule, MatButtonModule, MatIconModule, MatDividerModule],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
})
export class TarMenu {
  @Input({ required: true }) items: readonly TarMenuItem[] = [];
  @Input() triggerIcon = 'more_vert';
  @Input() ariaLabel = 'Open menu';
  @Input() xPosition: 'before' | 'after' = 'after';
  @Input() yPosition: 'above' | 'below' = 'below';
  @Input() testId: string | null = null;

  @Output() readonly itemSelected = new EventEmitter<string>();
}
