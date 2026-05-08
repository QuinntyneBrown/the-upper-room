// traces_to: L2-069
import { Component, inject } from '@angular/core';
import { ErrorBoundaryService } from '../error-boundary.service';

@Component({
  selector: 'app-error-boundary',
  template: `
    @if (svc.current(); as err) {
      <div data-testid="error-boundary" class="boundary" role="alert">
        <h1>Something went wrong</h1>
        <p>We've been notified. Please try again.</p>
        <p>
          Reference:
          <code data-testid="error-boundary-correlation">{{ err.correlationId }}</code>
        </p>
        <div class="actions">
          <button
            data-testid="error-boundary-copy"
            type="button"
            class="btn btn--ghost"
            (click)="copy(err.correlationId)"
          >
            Copy reference
          </button>
          <button
            data-testid="error-boundary-reload"
            type="button"
            class="btn"
            (click)="reload()"
          >
            Reload page
          </button>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .boundary {
        position: fixed;
        inset: 0;
        z-index: 80;
        display: grid;
        gap: var(--md-sys-space-3);
        justify-items: center;
        align-content: center;
        text-align: center;
        padding: var(--md-sys-space-8);
        background: var(--md-sys-color-background);
        color: var(--md-sys-color-on-background);
      }
      h1 {
        margin: 0;
        font: var(--md-sys-typescale-headline-medium);
      }
      p {
        margin: 0;
      }
      code {
        font-family: ui-monospace, monospace;
        background: var(--md-sys-color-surface-container);
        padding: var(--md-sys-space-1) var(--md-sys-space-2);
        border-radius: var(--md-sys-shape-corner-extra-small);
      }
      .actions {
        display: flex;
        gap: var(--md-sys-space-2);
      }
      .btn {
        border: 0;
        border-radius: var(--md-sys-shape-corner-full);
        padding: var(--md-sys-space-2) var(--md-sys-space-6);
        background: var(--md-sys-color-primary);
        color: var(--md-sys-color-on-primary);
        font: var(--md-sys-typescale-label-large);
        cursor: pointer;
      }
      .btn--ghost {
        background: transparent;
        color: inherit;
        border: 1px solid var(--md-sys-color-outline);
      }
    `,
  ],
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
