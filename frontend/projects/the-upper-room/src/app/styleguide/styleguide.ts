// traces_to: L2-001..L2-008, L2-061, L2-099, L2-100, L2-103, L2-104, L2-105
import { Component, inject, signal } from '@angular/core';
import { TarIcon } from '../../../../components/src/lib/icon/icon';
import { SnackbarService } from '../../../../components/src/lib/snackbar/tar-snackbar.service';
import {
  ConfirmService,
  ConfirmSeverity,
} from '../../../../components/src/lib/confirm-dialog/confirm.service';
import { TarEmptyState } from '../../../../components/src/lib/states/tar-empty-state';
import { TarSkeleton } from '../../../../components/src/lib/states/tar-skeleton';
import { TarListError } from '../../../../components/src/lib/states/tar-list-error';
import { TranslocoPipe } from '../i18n/transloco.pipe';
import { TarTagSelector } from '../tags/tag-selector/tar-tag-selector';
import type { Tag } from '../tags/tag-list/tag-list';

@Component({
  selector: 'app-styleguide',
  imports: [TarIcon, TarEmptyState, TarSkeleton, TarListError, TranslocoPipe, TarTagSelector],
  template: `
    <h2 data-testid="greeting">{{ 'styleguide.greeting' | transloco }}</h2>

    <tar-tag-selector [tags]="selectedTags()" (tagsChange)="selectedTags.set($event)" />

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

    <div class="demos">
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

      <button data-testid="confirm-trigger-info" type="button" (click)="confirm('info')">
        confirm-info
      </button>
      <button data-testid="confirm-trigger-warning" type="button" (click)="confirm('warning')">
        confirm-warning
      </button>
      <button
        data-testid="confirm-trigger-danger-typed"
        type="button"
        (click)="confirmTyped()"
      >
        confirm-danger-typed
      </button>
      <span data-testid="confirm-result">{{ confirmResult() }}</span>
    </div>

    <div data-testid="empty-demo">
      <tar-empty-state heading="Nothing here" body="Add your first item to get started." />
    </div>

    <div data-testid="skeleton-demo">
      <tar-skeleton />
    </div>

    <div data-testid="error-demo">
      <tar-list-error correlationId="test-correlation" (retry)="onRetry()" />
      <span data-testid="error-retry-count">{{ retryCount() }}</span>
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

      .demos {
        display: flex;
        flex-wrap: wrap;
        gap: var(--md-sys-space-2);
      }
    `,
  ],
})
export class Styleguide {
  private readonly snackbar = inject(SnackbarService);
  private readonly confirmer = inject(ConfirmService);

  protected readonly cards = Array.from({ length: 12 }, (_, i) => i + 1);
  protected readonly undoCount = signal(0);
  protected readonly confirmResult = signal('');
  protected readonly retryCount = signal(0);
  protected readonly selectedTags = signal<Tag[]>([]);

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

  protected async confirm(severity: ConfirmSeverity): Promise<void> {
    const ok = await this.confirmer.confirm({
      severity,
      title: `${severity} action`,
      body: 'Are you sure?',
    });
    this.confirmResult.set(String(ok));
  }

  protected async confirmTyped(): Promise<void> {
    const ok = await this.confirmer.confirm({
      severity: 'danger',
      title: 'Delete forever?',
      body: 'This cannot be undone.',
      requireTypedConfirmation: 'DELETE',
      confirmLabel: 'Delete',
    });
    this.confirmResult.set(String(ok));
  }

  protected onRetry(): void {
    this.retryCount.update((n) => n + 1);
  }
}
