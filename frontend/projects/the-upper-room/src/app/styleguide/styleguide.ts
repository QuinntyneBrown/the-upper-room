// traces_to: L2-001..L2-008, L2-061, L2-099, L2-100, L2-103, L2-104, L2-105
import { Component, inject, signal } from '@angular/core';
import {
  ConfirmService,
  ConfirmSeverity,
  SnackbarService,
  TarButton,
  TarEmptyState,
  TarIcon,
  TarListError,
  TarSkeleton,
  TranslocoPipe,
} from 'components';
import { TarTagSelector, Tag } from 'domain';

@Component({
  selector: 'app-styleguide',
  imports: [
    TarIcon,
    TarButton,
    TarEmptyState,
    TarSkeleton,
    TarListError,
    TranslocoPipe,
    TarTagSelector,
  ],
  templateUrl: './styleguide.html',
  styleUrl: './styleguide.scss',
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
