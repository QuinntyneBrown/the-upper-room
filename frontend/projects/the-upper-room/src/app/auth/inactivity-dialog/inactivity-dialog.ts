// traces_to: L2-022
import { Component, inject } from '@angular/core';
import { IdleService } from '../idle.service';

@Component({
  selector: 'app-inactivity-dialog',
  template: `
    @if (idle.state() === 'warning') {
      <div class="backdrop"></div>
      <div data-testid="inactivity-dialog" class="dialog" role="alertdialog" aria-modal="true">
        <h2>Are you still there?</h2>
        <p>
          You'll be signed out in
          <span data-testid="inactivity-countdown">{{ idle.countdown() }}</span> seconds.
        </p>
        <button
          data-testid="inactivity-stay"
          type="button"
          class="btn"
          (click)="idle.staySignedIn()"
        >
          Stay signed in
        </button>
      </div>
    }
  `,
  styles: [
    `
      .backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.32);
        z-index: 60;
      }
      .dialog {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--md-sys-color-surface-container-high);
        color: var(--md-sys-color-on-surface);
        padding: var(--md-sys-space-6);
        border-radius: var(--md-sys-shape-corner-extra-large);
        box-shadow: var(--md-sys-elevation-level-3);
        z-index: 70;
        min-width: 280px;
        max-width: 400px;
        display: grid;
        gap: var(--md-sys-space-4);
        text-align: center;
      }
      h2 {
        margin: 0;
        font: var(--md-sys-typescale-headline-small);
      }
      p {
        margin: 0;
      }
      .btn {
        border: 0;
        border-radius: var(--md-sys-shape-corner-full);
        padding: var(--md-sys-space-3) var(--md-sys-space-6);
        background: var(--md-sys-color-primary);
        color: var(--md-sys-color-on-primary);
        font: var(--md-sys-typescale-label-large);
        cursor: pointer;
      }
    `,
  ],
})
export class InactivityDialog {
  protected readonly idle = inject(IdleService);
}
