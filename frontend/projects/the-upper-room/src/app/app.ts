// traces_to: L2-074
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TarSnackbar } from '../../../components/src/lib/snackbar/tar-snackbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TarSnackbar],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
