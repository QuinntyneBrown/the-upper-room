// traces_to: L2-099
import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import type { ConfirmOptions } from './confirm.service';

@Component({
  selector: 'tar-confirm-dialog',
  imports: [MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule],
  templateUrl: './tar-confirm-dialog.html',
  styleUrl: './tar-confirm-dialog.scss',
  host: {
    'data-testid': 'confirm-dialog',
    '[attr.data-severity]': "data.severity ?? 'info'",
  },
})
export class TarConfirmDialog {
  protected readonly data = inject<ConfirmOptions>(MAT_DIALOG_DATA);
  private readonly ref = inject<MatDialogRef<TarConfirmDialog, boolean>>(MatDialogRef);
  protected readonly typed = signal('');

  protected readonly confirmEnabled = computed(() => {
    if (!this.data.requireTypedConfirmation) return true;
    return this.typed() === this.data.requireTypedConfirmation;
  });

  protected confirm(): void {
    this.ref.close(true);
  }

  protected cancel(): void {
    this.ref.close(false);
  }
}
