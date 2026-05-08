// traces_to: L2-007
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ICON_ALIASES, IconSize } from './icon-aliases';

@Component({
  selector: 'tar-icon',
  imports: [MatIconModule],
  templateUrl: './icon.html',
  styleUrl: './icon.scss',
})
export class TarIcon {
  @Input({ required: true }) name!: string;
  @Input() size: IconSize = 'md';

  get glyph(): string {
    return ICON_ALIASES[this.name] ?? this.name;
  }
}
