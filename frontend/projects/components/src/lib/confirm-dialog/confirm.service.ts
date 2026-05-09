// traces_to: L2-099
import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { TarConfirmDialog } from './tar-confirm-dialog';

export type ConfirmSeverity = 'info' | 'warning' | 'danger';

export interface ConfirmOptions {
  readonly title: string;
  readonly body?: string;
  readonly severity?: ConfirmSeverity;
  readonly confirmLabel?: string;
  readonly cancelLabel?: string;
  readonly requireTypedConfirmation?: string;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly dialog = inject(MatDialog);

  constructor() {
    if (typeof window !== 'undefined') {
      (window as unknown as { __openConfirmDialog: (o: ConfirmOptions) => Promise<boolean> }).__openConfirmDialog =
        (o) => this.confirm(o);
    }
  }

  async confirm(options: ConfirmOptions): Promise<boolean> {
    const ref = this.dialog.open<TarConfirmDialog, ConfirmOptions, boolean>(TarConfirmDialog, {
      data: options,
      autoFocus: '[data-testid="confirm-cancel"]',
      restoreFocus: true,
      panelClass: 'tar-confirm-dialog-panel',
      ariaLabelledBy: 'confirm-dialog-title',
    });
    const result = await firstValueFrom(ref.afterClosed());
    return result === true;
  }
}
