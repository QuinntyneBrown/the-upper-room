// traces_to: L2-118
import { Component, inject, DOCUMENT } from '@angular/core';
import { SnackbarService } from '../snackbar/tar-snackbar.service';

@Component({
  selector: 'tar-share-button',
  template: `
    <button
      type="button"
      class="tar-share-button"
      aria-label="Share"
      data-testid="share-button"
      (click)="share()"
    >
      <span class="material-icons">share</span>
    </button>
  `,
  styles: [`
    .tar-share-button {
      background: transparent;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 8px;
      border-radius: 50%;
    }
    .tar-share-button:hover { background: rgba(0,0,0,.08); }
  `],
})
export class TarShareButton {
  private readonly snackbar = inject(SnackbarService);
  private readonly doc = inject(DOCUMENT);

  protected async share(): Promise<void> {
    const url = this.doc.defaultView?.location.href ?? '';
    const nav = this.doc.defaultView?.navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
    if (nav?.share) {
      try { await nav.share({ url }); return; } catch { /* user cancelled */ return; }
    }
    try {
      await nav?.clipboard?.writeText(url);
      this.snackbar.show('Link copied to clipboard.', 'info');
    } catch { /* clipboard permission denied — fail silently */ }
  }
}
