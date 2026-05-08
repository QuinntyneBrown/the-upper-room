// traces_to: L2-069
import { Component, inject } from '@angular/core';
import { TarButton } from 'components';
import { ErrorBoundaryService } from '../error-boundary.service';

@Component({
  selector: 'app-error-boundary',
  imports: [TarButton],
  templateUrl: './error-boundary.html',
  styleUrl: './error-boundary.scss',
})
export class ErrorBoundary {
  protected readonly svc = inject(ErrorBoundaryService);

  protected copy(value: string): void {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(value).catch(() => this.fallbackCopy(value));
    } else {
      this.fallbackCopy(value);
    }
  }

  protected reload(): void {
    this.svc.clear();
    window.location.reload();
  }

  private fallbackCopy(value: string): void {
    const el = document.createElement('textarea');
    el.value = value;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    el.remove();
  }
}
