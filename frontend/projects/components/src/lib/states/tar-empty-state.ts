// traces_to: L2-103
import { Component, Input } from '@angular/core';
import { TarIcon } from '../icon/icon';

@Component({
  selector: 'tar-empty-state',
  imports: [TarIcon],
  template: `
    <tar-icon [name]="icon" size="xl" />
    <h2 data-testid="empty-heading" class="empty__heading">{{ heading }}</h2>
    <p data-testid="empty-body" class="empty__body">{{ body }}</p>
    <ng-content />
  `,
  styles: [
    `
      :host {
        display: grid;
        gap: var(--md-sys-space-3);
        justify-items: center;
        text-align: center;
        padding: var(--md-sys-space-8);
        color: var(--md-sys-color-on-surface-variant);
      }
      .empty__heading {
        margin: 0;
        color: var(--md-sys-color-on-surface);
        font: var(--md-sys-typescale-headline-small);
      }
      .empty__body {
        margin: 0;
        max-width: 360px;
        font: var(--md-sys-typescale-body-medium);
      }
    `,
  ],
})
export class TarEmptyState {
  @Input({ required: true }) heading!: string;
  @Input({ required: true }) body!: string;
  @Input() icon = 'info';
}
