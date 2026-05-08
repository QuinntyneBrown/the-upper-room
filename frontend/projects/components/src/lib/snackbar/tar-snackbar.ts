// traces_to: L2-061
import { Component, computed, inject } from '@angular/core';
import { SnackbarService } from './tar-snackbar.service';

@Component({
  selector: 'tar-snackbar',
  template: `
    @if (svc.current(); as item) {
      <div
        data-testid="snackbar"
        class="snackbar"
        [class]="'snackbar--' + item.severity + ' ' + viewportClass()"
        [attr.role]="item.severity === 'error' ? 'alert' : 'status'"
        (mouseenter)="svc.pause()"
        (mouseleave)="svc.resume()"
        (focusin)="svc.pause()"
        (focusout)="svc.resume()"
      >
        <span data-testid="snackbar-message" class="snackbar__message">{{ item.message }}</span>
        @if (item.action; as action) {
          <button
            data-testid="snackbar-action"
            type="button"
            class="snackbar__action"
            (click)="onAction()"
          >
            {{ action.label }}
          </button>
        }
        <button
          data-testid="snackbar-dismiss"
          type="button"
          class="snackbar__dismiss"
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
      .snackbar {
        position: fixed;
        bottom: var(--md-sys-space-6);
        left: var(--md-sys-space-6);
        max-width: 560px;
        min-width: 288px;
        padding: var(--md-sys-space-4);
        display: flex;
        align-items: center;
        gap: var(--md-sys-space-4);
        border-radius: var(--md-sys-shape-corner-extra-small);
        box-shadow: var(--md-sys-elevation-level-3);
        font: var(--md-sys-typescale-body-medium);
        z-index: 50;
      }

      .snackbar--xs {
        left: 50%;
        right: auto;
        transform: translateX(-50%);
      }

      .snackbar--info {
        background: var(--md-sys-color-inverse-surface);
        color: var(--md-sys-color-inverse-on-surface);
      }

      .snackbar--success {
        background: #1b5e20;
        color: #ffffff;
      }

      .snackbar--warning {
        background: #e65100;
        color: #ffffff;
      }

      .snackbar--error {
        background: var(--md-sys-color-error-container);
        color: var(--md-sys-color-on-error-container);
      }

      .snackbar__message {
        flex: 1;
      }

      .snackbar__action {
        background: transparent;
        border: 0;
        color: var(--md-sys-color-inverse-primary);
        font: var(--md-sys-typescale-label-large);
        cursor: pointer;
      }

      .snackbar__dismiss {
        background: transparent;
        border: 0;
        color: inherit;
        font-size: 18px;
        cursor: pointer;
      }
    `,
  ],
})
export class TarSnackbar {
  protected readonly svc = inject(SnackbarService);

  protected readonly viewportClass = computed(() => {
    if (typeof window === 'undefined') return '';
    return window.matchMedia('(max-width: 575px)').matches ? 'snackbar--xs' : '';
  });

  protected onAction(): void {
    const action = this.svc.current()?.action;
    this.svc.dismiss();
    action?.onClick();
  }
}
