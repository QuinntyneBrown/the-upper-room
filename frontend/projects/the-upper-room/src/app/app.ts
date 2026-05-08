// traces_to: L2-074, L2-022
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TarSnackbar } from '../../../components/src/lib/snackbar/tar-snackbar';
import { TarConfirmDialog } from '../../../components/src/lib/confirm-dialog/tar-confirm-dialog';
import { ErrorBoundary } from './error/error-boundary/error-boundary';
import { InactivityDialog } from './auth/inactivity-dialog/inactivity-dialog';
import { IdleService } from './auth/idle.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TarSnackbar, TarConfirmDialog, ErrorBoundary, InactivityDialog],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  // Eagerly construct so its activity listeners attach at app start.
  private readonly idle = inject(IdleService);
}
