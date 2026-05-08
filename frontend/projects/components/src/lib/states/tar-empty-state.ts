// traces_to: L2-103
import { Component, Input } from '@angular/core';
import { TarIcon } from '../icon/icon';

@Component({
  selector: 'tar-empty-state',
  imports: [TarIcon],
  templateUrl: './tar-empty-state.html',
  styleUrl: './tar-empty-state.scss',
})
export class TarEmptyState {
  @Input({ required: true }) heading!: string;
  @Input({ required: true }) body!: string;
  @Input() icon = 'info';
}
