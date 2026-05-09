// traces_to: L2-110
import { Component } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { TarRelativeTime } from 'components';

@Component({
  selector: 'app-date-formatting-test',
  imports: [TarRelativeTime, DecimalPipe],
  templateUrl: './date-formatting-test.html',
})
export class DateFormattingTest {
  protected readonly t5m = new Date(Date.now() - 5 * 60 * 1000);
  protected readonly t3d = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  protected readonly t8d = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
  protected readonly bigNumber = 1_234_567;
}
