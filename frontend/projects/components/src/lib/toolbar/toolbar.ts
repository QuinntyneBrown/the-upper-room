import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'tar-toolbar',
  imports: [MatToolbarModule, MatButtonModule, MatIconModule],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.scss',
})
export class TarToolbar {
  @Input() title: string | null = null;
  @Input() color: 'primary' | 'accent' | 'warn' | undefined = undefined;
  @Input() showMenu = false;
  @Input() menuAriaLabel = 'Open navigation';
  @Input() scrolled = false;
  @Input() testId: string | null = null;

  @Output() readonly menuClicked = new EventEmitter<void>();
}
