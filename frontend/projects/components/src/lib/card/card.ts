import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

export type TarCardAppearance = 'outlined' | 'raised' | 'filled';

@Component({
  selector: 'tar-card',
  imports: [MatCardModule],
  templateUrl: './card.html',
  styleUrl: './card.scss',
})
export class TarCard {
  @Input() heading: string | null = null;
  @Input() subheading: string | null = null;
  @Input() appearance: TarCardAppearance = 'filled';
  @Input() interactive = false;
  @Input() showActions = false;
  @Input() testId: string | null = null;

  @Output() readonly clicked = new EventEmitter<MouseEvent | KeyboardEvent>();
}
