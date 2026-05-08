import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'tar-toggle',
  imports: [MatSlideToggleModule],
  templateUrl: './toggle.html',
  styleUrl: './toggle.scss',
})
export class TarToggle {
  @Input() checked = false;
  @Input() disabled = false;
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() ariaLabel: string | null = null;
  @Input() testId: string | null = null;

  @Output() readonly checkedChange = new EventEmitter<boolean>();
}
