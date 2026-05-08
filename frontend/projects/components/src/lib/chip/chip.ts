import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'tar-chip',
  imports: [MatChipsModule, MatIconModule],
  templateUrl: './chip.html',
  styleUrl: './chip.scss',
})
export class TarChip {
  @Input({ required: true }) label!: string;
  @Input() icon: string | null = null;
  @Input() selectable = false;
  @Input() selected = false;
  @Input() removable = false;
  @Input() disabled = false;
  @Input() testId: string | null = null;

  @Output() readonly selectionChange = new EventEmitter<boolean>();
  @Output() readonly removed = new EventEmitter<void>();
}
