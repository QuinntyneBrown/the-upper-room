// traces_to: L2-074
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SnackbarHost } from './snackbar-host/snackbar-host';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SnackbarHost],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
