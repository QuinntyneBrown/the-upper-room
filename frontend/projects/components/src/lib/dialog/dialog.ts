import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'tar-dialog',
  imports: [MatCardModule],
  templateUrl: './dialog.html',
  styleUrl: './dialog.scss',
})
export class TarDialog {
  @Input() open = false;
  @Input() title: string | null = null;
  @Input() subtitle: string | null = null;
  @Input() ariaLabel: string | null = null;
  @Input() showActions = true;
  @Input() closeOnBackdrop = true;
  @Input() testId: string | null = null;

  @Output() readonly closed = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.open) this.closed.emit();
  }
}
