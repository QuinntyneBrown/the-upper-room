// traces_to: L2-061
import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { SnackbarService } from './tar-snackbar.service';

@Component({
  selector: 'tar-snackbar',
  imports: [MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './tar-snackbar.html',
  styleUrl: './tar-snackbar.scss',
})
export class TarSnackbar {
  protected readonly svc = inject(SnackbarService);

  protected readonly viewportClass = computed(() => {
    if (typeof window === 'undefined') return '';
    return window.matchMedia('(max-width: 575px)').matches ? 'tar-snackbar--xs' : '';
  });

  protected onAction(): void {
    const action = this.svc.current()?.action;
    this.svc.dismiss();
    action?.onClick();
  }
}
