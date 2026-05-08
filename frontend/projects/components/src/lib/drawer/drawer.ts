import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export type TarDrawerPosition = 'start' | 'end';

@Component({
  selector: 'tar-drawer',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './drawer.html',
  styleUrl: './drawer.scss',
})
export class TarDrawer {
  @Input() open = false;
  @Input() title: string | null = null;
  @Input() position: TarDrawerPosition = 'end';
  @Input() role: 'dialog' | 'complementary' = 'dialog';
  @Input() ariaLabel: string | null = null;
  @Input() closeOnScrim = true;
  @Input() testId: string | null = null;

  @Output() readonly closed = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.open) this.closed.emit();
  }
}
