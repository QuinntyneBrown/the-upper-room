// traces_to: L2-074
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TarSnackbar } from '../../../components/src/lib/snackbar/tar-snackbar';
import { TarConfirmDialog } from '../../../components/src/lib/confirm-dialog/tar-confirm-dialog';
import { ErrorBoundary } from './error/error-boundary/error-boundary';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TarSnackbar, TarConfirmDialog, ErrorBoundary],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
