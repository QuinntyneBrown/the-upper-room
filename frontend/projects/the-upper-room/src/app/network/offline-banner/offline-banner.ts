// traces_to: L2-070
import { Component, inject } from '@angular/core';
import { TarIcon } from '../../../../../components/src/lib/icon/icon';
import { NetworkService } from '../network.service';

@Component({
  selector: 'app-offline-banner',
  imports: [TarIcon],
  template: `
    @if (svc.bannerState(); as state) {
      <div
        data-testid="offline-banner"
        class="banner"
        [class.banner--online]="state === 'online'"
        role="status"
      >
        <tar-icon [name]="state === 'offline' ? 'wifi_off' : 'success'" />
        <span data-testid="offline-banner-text" class="banner__text">
          {{
            state === 'offline'
              ? "You're offline. Some features may be unavailable."
              : 'Back online'
          }}
        </span>
        <button
          data-testid="offline-banner-close"
          type="button"
          class="banner__close"
          aria-label="Dismiss"
          (click)="svc.dismiss()"
        >
          ×
        </button>
      </div>
    }
  `,
  styles: [
    `
      .banner {
        display: flex;
        align-items: center;
        gap: var(--md-sys-space-2);
        padding: var(--md-sys-space-2) var(--md-sys-space-4);
        background: var(--md-sys-color-error-container);
        color: var(--md-sys-color-on-error-container);
        font: var(--md-sys-typescale-body-medium);
      }
      .banner--online {
        background: var(--md-sys-color-tertiary-container);
        color: var(--md-sys-color-on-tertiary-container);
      }
      .banner__text {
        flex: 1;
      }
      .banner__close {
        background: transparent;
        border: 0;
        color: inherit;
        font-size: 18px;
        cursor: pointer;
      }
    `,
  ],
})
export class OfflineBanner {
  protected readonly svc = inject(NetworkService);
}
