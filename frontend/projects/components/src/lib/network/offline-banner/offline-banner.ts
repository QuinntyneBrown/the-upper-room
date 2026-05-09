// traces_to: L2-070
import { Component, inject } from '@angular/core';
import { TarBanner } from '../../banner/banner';
import { NetworkService } from '../network.service';

@Component({
  selector: 'app-offline-banner',
  imports: [TarBanner],
  templateUrl: './offline-banner.html',
  styleUrl: './offline-banner.scss',
})
export class OfflineBanner {
  protected readonly svc = inject(NetworkService);
  protected readonly offlineMessage = "You're offline. Some features may be unavailable.";
  protected readonly onlineMessage = 'Back online';
}
