// traces_to: L2-074, L2-022
import { Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TarSnackbar } from '../../../components/src/lib/snackbar/tar-snackbar';
import { ErrorBoundary } from './error/error-boundary/error-boundary';
import { IdleService, InactivityDialog } from 'domain';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TarSnackbar, ErrorBoundary],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly idle = inject(IdleService);
  private readonly dialog = inject(MatDialog);
  private inactivityRef: MatDialogRef<InactivityDialog> | null = null;

  constructor() {
    effect(() => {
      const state = this.idle.state();
      if (state === 'warning' && !this.inactivityRef) {
        this.inactivityRef = this.dialog.open(InactivityDialog, { disableClose: true });
        this.inactivityRef.afterClosed().subscribe(() => (this.inactivityRef = null));
      } else if (state === 'active' && this.inactivityRef) {
        this.inactivityRef.close();
        this.inactivityRef = null;
      }
    });
  }
}
