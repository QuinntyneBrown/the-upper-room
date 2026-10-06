import { Component, Input, inject } from '@angular/core';

import { SnackbarService, TarButton, type SnackbarSeverity } from 'components';

/**
 * Story-only host: a `tar-button` that calls the real `SnackbarService.show()`.
 * When `actionLabel` is set, the snackbar gets an action that shows a follow-up
 * success message.
 */
@Component({
  selector: 'story-snackbar-trigger',
  imports: [TarButton],
  templateUrl: './SnackbarTrigger.html',
})
export class SnackbarTrigger {
  private readonly snackbar = inject(SnackbarService);

  @Input({ required: true }) message!: string;
  @Input() severity: SnackbarSeverity = 'info';
  @Input() actionLabel: string | null = null;
  @Input() actionResult = 'Done';
  @Input() variant: 'filled' | 'tonal' | 'outlined' | 'text' = 'tonal';
  @Input() testId: string | null = null;

  show(): void {
    const action = this.actionLabel
      ? {
          label: this.actionLabel,
          onClick: () => this.snackbar.show(this.actionResult, 'success'),
        }
      : undefined;
    this.snackbar.show(this.message, this.severity, action);
  }
}
