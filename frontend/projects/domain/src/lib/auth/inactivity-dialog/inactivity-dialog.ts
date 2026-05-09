// traces_to: L2-022
import { Component, inject } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { TarButton } from 'components';
import { IdleService } from '../idle.service';

@Component({
  selector: 'app-inactivity-dialog',
  imports: [MatDialogModule, TarButton],
  templateUrl: './inactivity-dialog.html',
  styleUrl: './inactivity-dialog.scss',
  host: {
    'data-testid': 'inactivity-dialog',
  },
})
export class InactivityDialog {
  protected readonly idle = inject(IdleService);
}
