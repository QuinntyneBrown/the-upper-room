import { Component, Input } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';

export type TarProgressBarMode = 'determinate' | 'indeterminate' | 'buffer' | 'query';

@Component({
  selector: 'tar-progress-bar',
  imports: [MatProgressBarModule],
  templateUrl: './progress-bar.html',
  styleUrl: './progress-bar.scss',
})
export class TarProgressBar {
  @Input() mode: TarProgressBarMode = 'indeterminate';
  @Input() value = 0;
  @Input() bufferValue = 0;
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() ariaLabel = 'Loading';
  @Input() testId: string | null = null;
}
