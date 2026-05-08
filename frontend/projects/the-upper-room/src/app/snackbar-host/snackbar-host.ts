// traces_to: L2-066
import { Component, inject } from '@angular/core';
import { SnackbarService } from '../services/snackbar.service';

@Component({
  selector: 'app-snackbar-host',
  template: `
    @if (svc.message(); as m) {
      <div data-testid="snackbar" class="snackbar" role="status" (click)="svc.dismiss()">
        {{ m }}
      </div>
    }
  `,
  styles: [
    `
      .snackbar {
        position: fixed;
        left: 50%;
        bottom: var(--md-sys-space-6);
        transform: translateX(-50%);
        background: var(--md-sys-color-inverse-surface);
        color: var(--md-sys-color-inverse-on-surface);
        padding: var(--md-sys-space-3) var(--md-sys-space-4);
        border-radius: var(--md-sys-shape-corner-extra-small);
        box-shadow: var(--md-sys-elevation-level-3);
        z-index: 50;
      }
    `,
  ],
})
export class SnackbarHost {
  protected readonly svc = inject(SnackbarService);
}
