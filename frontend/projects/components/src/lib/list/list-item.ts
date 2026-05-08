import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'tar-list-item',
  imports: [MatListModule, MatIconModule],
  templateUrl: './list-item.html',
  styleUrl: './list-item.scss',
})
export class TarListItem {
  @Input() title: string | null = null;
  @Input() description: string | null = null;
  @Input() icon: string | null = null;
  @Input() active = false;
  @Input() interactive = false;
  @Input() testId: string | null = null;

  @Output() readonly clicked = new EventEmitter<MouseEvent>();
}
