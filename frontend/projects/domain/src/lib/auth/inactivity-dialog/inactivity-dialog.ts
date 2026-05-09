// traces_to: L2-022
import { Component, inject } from '@angular/core';
import { TarButton, TarDialog } from 'components';
import { IdleService } from '../idle.service';

@Component({
  selector: 'app-inactivity-dialog',
  imports: [TarDialog, TarButton],
  templateUrl: './inactivity-dialog.html',
  styleUrl: './inactivity-dialog.scss',
})
export class InactivityDialog {
  protected readonly idle = inject(IdleService);
}
