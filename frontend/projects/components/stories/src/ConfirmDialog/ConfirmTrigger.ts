import { Component, inject, input, signal } from '@angular/core';

import { ConfirmService, TarButton, type ConfirmOptions } from 'components';

/**
 * Story-only host: a `tar-button` that opens the real dialog through
 * `ConfirmService.confirm()` and shows the resolved boolean.
 */
@Component({
  selector: 'story-confirm-trigger',
  imports: [TarButton],
  templateUrl: './ConfirmTrigger.html',
})
export class ConfirmTrigger {
  readonly options = input.required<ConfirmOptions>();
  readonly testId = input<string | null>(null);

  protected readonly answer = signal<string | null>(null);

  private readonly confirmService = inject(ConfirmService);

  async open(): Promise<void> {
    const ok = await this.confirmService.confirm(this.options());
    this.answer.set(ok ? 'confirmed' : 'cancelled');
  }
}
