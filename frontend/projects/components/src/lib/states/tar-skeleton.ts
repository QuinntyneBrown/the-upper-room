// traces_to: L2-104
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tar-skeleton',
  template: `
    @for (i of rows(); track i) {
      <div class="skeleton__row" [style.height.px]="rowHeight"></div>
    }
  `,
  styles: [
    `
      :host {
        display: grid;
        gap: var(--md-sys-space-2);
      }
      .skeleton__row {
        background: linear-gradient(
          90deg,
          var(--md-sys-color-surface-container-low),
          var(--md-sys-color-surface-container-high),
          var(--md-sys-color-surface-container-low)
        );
        background-size: 200% 100%;
        border-radius: var(--md-sys-shape-corner-small);
        animation: shimmer 1.4s linear infinite;
      }

      @keyframes shimmer {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .skeleton__row {
          animation-duration: 0s;
        }
      }
    `,
  ],
})
export class TarSkeleton {
  @Input() rowCount = 5;
  @Input() rowHeight = 56;

  rows(): number[] {
    return Array.from({ length: this.rowCount }, (_, i) => i);
  }
}
