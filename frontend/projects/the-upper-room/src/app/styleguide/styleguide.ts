// traces_to: L2-001..L2-007
import { Component } from '@angular/core';
import { TarIcon } from '../../../../components/src/lib/icon/icon';

@Component({
  selector: 'app-styleguide',
  imports: [TarIcon],
  template: `
    <button data-testid="seed-button" class="seed-button" type="button">Action</button>
    <div data-testid="seed-card" class="seed-card">Card</div>
    <span data-testid="seed-chip" class="seed-chip">Chip</span>
    <tar-icon name="contacts" />
    <tar-icon name="partners" size="lg" />
  `,
  styles: [
    `
      :host {
        display: grid;
        gap: var(--md-sys-space-4);
        padding: var(--md-sys-space-6);
      }

      .seed-button {
        border: 0;
        border-radius: var(--md-sys-shape-corner-full);
        padding: var(--md-sys-space-2) var(--md-sys-space-6);
        background: var(--md-sys-color-primary);
        color: var(--md-sys-color-on-primary);
        font: var(--md-sys-typescale-label-large);
        transition: background var(--md-sys-motion-duration-short3)
          var(--md-sys-motion-easing-standard);
      }

      .seed-card {
        border-radius: var(--md-sys-shape-corner-medium);
        padding: var(--md-sys-space-4);
        background: var(--md-sys-color-surface-container);
        color: var(--md-sys-color-on-surface);
        box-shadow: var(--md-sys-elevation-level-1);
      }

      .seed-chip {
        font: var(--md-sys-typescale-body-medium);
        padding: var(--md-sys-space-1) var(--md-sys-space-3);
        border-radius: var(--md-sys-shape-corner-small);
        background: var(--md-sys-color-secondary-container);
        color: var(--md-sys-color-on-secondary-container);
      }
    `,
  ],
})
export class Styleguide {}
