import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'tar-page-header',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './page-header.html',
  styleUrl: './page-header.scss',
})
export class TarPageHeader {
  @Input({ required: true }) title!: string;
  @Input() eyebrow: string | null = null;
  @Input() subtitle: string | null = null;
  @Input() showBack = false;
  @Input() backLabel = 'Back';
  @Input() scrolled = false;
  @Input() testId: string | null = null;

  @Output() readonly backClicked = new EventEmitter<void>();
}
