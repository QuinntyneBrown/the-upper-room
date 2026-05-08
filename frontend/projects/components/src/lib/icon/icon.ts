// traces_to: L2-007
import { Component, Input } from '@angular/core';
import { ICON_ALIASES, IconSize } from './icon-aliases';

@Component({
  selector: 'tar-icon',
  template: `<span
    class="tar-icon"
    [attr.data-testid]="'icon-' + name"
    [attr.aria-label]="name"
    [style.font-size]="'var(--icon-size-' + size + ')'"
    >{{ glyph }}</span
  >`,
  styles: [
    `
      .tar-icon {
        font-family: 'Material Symbols Rounded', sans-serif;
        font-weight: 400;
        font-style: normal;
        line-height: 1;
        font-variation-settings:
          'FILL' 0,
          'wght' 400,
          'GRAD' 0,
          'opsz' 24;
      }
    `,
  ],
})
export class TarIcon {
  @Input({ required: true }) name!: string;
  @Input() size: IconSize = 'md';

  get glyph(): string {
    return ICON_ALIASES[this.name] ?? this.name;
  }
}
