// traces_to: L2-118
import { Component, inject, DOCUMENT } from '@angular/core';
import { SnackbarService } from '../snackbar/tar-snackbar.service';

@Component({
  selector: 'tar-share-button',
  templateUrl: './share-button.html',
  styleUrl: './share-button.scss',
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
