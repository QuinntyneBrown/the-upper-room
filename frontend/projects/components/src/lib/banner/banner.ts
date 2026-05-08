import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export type TarBannerSeverity = 'info' | 'success' | 'warning' | 'error';

@Component({
  selector: 'tar-banner',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './banner.html',
  styleUrl: './banner.scss',
})
export class TarBanner {
  @Input({ required: true }) message!: string;
  @Input() severity: TarBannerSeverity = 'info';
  @Input() icon: string | null = null;
  @Input() actionLabel: string | null = null;
  @Input() dismissible = true;
  @Input() dismissLabel = 'Dismiss';
  @Input() visible = true;
  @Input() testId: string | null = null;

  @Output() readonly actioned = new EventEmitter<void>();
  @Output() readonly dismissed = new EventEmitter<void>();
}
