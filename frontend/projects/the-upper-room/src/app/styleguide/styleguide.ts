// traces_to: L2-001..L2-008, L2-061
import { Component, inject, signal } from '@angular/core';
import { TarIcon } from '../../../../components/src/lib/icon/icon';
import { SnackbarService } from '../../../../components/src/lib/snackbar/tar-snackbar.service';

@Component({
  selector: 'app-styleguide',
  imports: [TarIcon],
  template: `
    <button data-testid="seed-button" class="seed-button" type="button">Action</button>
    <div data-testid="seed-card" class="seed-card">Card</div>
    <span data-testid="seed-chip" class="seed-chip">Chip</span>
    <tar-icon name="contacts" />
    <tar-icon name="partners" size="lg" />

    <div data-testid="grid-demo" class="u-grid">
      @for (i of cards; track i) {
        <div class="seed-card">{{ i }}</div>
      }
    </div>

    <div class="snackbar-demos">
      <button data-testid="snackbar-trigger-info" type="button" (click)="show('info')">info</button>
      <button data-testid="snackbar-trigger-success" type="button" (click)="show('success')">
        success
      </button>
      <button data-testid="snackbar-trigger-warning" type="button" (click)="show('warning')">
        warning
      </button>
      <button data-testid="snackbar-trigger-error" type="button" (click)="show('error')">
        error
      </button>
      <button data-testid="snackbar-trigger-with-undo" type="button" (click)="showUndo()">
        with-undo
      </button>
      <button data-testid="snackbar-trigger-queue-pair" type="button" (click)="showPair()">
        queue-pair
      </button>
      <span data-testid="undo-count">{{ undoCount() }}</span>
    </div>
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

      .snackbar-demos {
        display: flex;
        flex-wrap: wrap;
        gap: var(--md-sys-space-2);
      }
    `,
  ],
})
export class Styleguide {
  private readonly snackbar = inject(SnackbarService);
  protected readonly cards = Array.from({ length: 12 }, (_, i) => i + 1);
  protected readonly undoCount = signal(0);

  protected show(severity: 'info' | 'success' | 'warning' | 'error'): void {
    this.snackbar.show(`${severity} message`, severity);
  }

  protected showUndo(): void {
    this.snackbar.show('Item deleted', 'info', {
      label: 'Undo',
      onClick: () => this.undoCount.update((n) => n + 1),
    });
  }

  protected showPair(): void {
    this.snackbar.show('first', 'error');
    this.snackbar.show('second', 'error');
  }
}
