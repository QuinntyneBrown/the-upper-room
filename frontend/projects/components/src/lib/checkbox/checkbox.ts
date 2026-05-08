import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'tar-checkbox',
  imports: [MatCheckboxModule],
  templateUrl: './checkbox.html',
  styleUrl: './checkbox.scss',
})
export class TarCheckbox {
  @Input() checked = false;
  @Input() disabled = false;
  @Input() indeterminate = false;
  @Input() required = false;
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() ariaLabel: string | null = null;
  @Input() testId: string | null = null;

  @Output() readonly checkedChange = new EventEmitter<boolean>();
}
