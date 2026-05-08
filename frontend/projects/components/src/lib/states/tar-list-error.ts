// traces_to: L2-105
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { TarIcon } from '../icon/icon';

@Component({
  selector: 'tar-list-error',
  imports: [TarIcon, MatButtonModule],
  templateUrl: './tar-list-error.html',
  styleUrl: './tar-list-error.scss',
})
export class TarListError {
  @Input({ required: true }) correlationId!: string;
  @Output() retry = new EventEmitter<void>();
}
