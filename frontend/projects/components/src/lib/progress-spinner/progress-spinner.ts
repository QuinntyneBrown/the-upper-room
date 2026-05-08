import { Component, Input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'tar-progress-spinner',
  imports: [MatProgressSpinnerModule],
  templateUrl: './progress-spinner.html',
  styleUrl: './progress-spinner.scss',
})
export class TarProgressSpinner {
  @Input() mode: 'determinate' | 'indeterminate' = 'indeterminate';
  @Input() value = 0;
  @Input() diameter = 40;
  @Input() strokeWidth = 4;
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() ariaLabel = 'Loading';
  @Input() testId: string | null = null;
}
