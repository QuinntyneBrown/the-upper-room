// traces_to: L2-105
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TarIcon } from '../icon/icon';

@Component({
  selector: 'tar-list-error',
  imports: [TarIcon],
  template: `
    <tar-icon name="error" size="xl" />
    <h2 data-testid="error-heading" class="error__heading">We couldn't load this</h2>
    <p data-testid="error-body" class="error__body">
      Something went wrong. Reference: {{ correlationId }}
    </p>
    <button
      data-testid="error-retry"
      type="button"
      class="error__retry"
      (click)="retry.emit()"
    >
      Try again
    </button>
  `,
  styles: [
    `
      :host {
        display: grid;
        gap: var(--md-sys-space-3);
        justify-items: center;
        text-align: center;
        padding: var(--md-sys-space-8);
      }
      .error__heading {
        margin: 0;
        font: var(--md-sys-typescale-headline-small);
      }
      .error__body {
        margin: 0;
        max-width: 360px;
        font: var(--md-sys-typescale-body-medium);
        color: var(--md-sys-color-on-surface-variant);
      }
      .error__retry {
        border: 0;
        border-radius: var(--md-sys-shape-corner-full);
        padding: var(--md-sys-space-2) var(--md-sys-space-6);
        background: var(--md-sys-color-primary);
        color: var(--md-sys-color-on-primary);
        font: var(--md-sys-typescale-label-large);
        cursor: pointer;
      }
    `,
  ],
})
export class TarListError {
  @Input({ required: true }) correlationId!: string;
  @Output() retry = new EventEmitter<void>();
}
