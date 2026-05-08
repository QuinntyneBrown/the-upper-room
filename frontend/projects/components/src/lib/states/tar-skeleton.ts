// traces_to: L2-104
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tar-skeleton',
  templateUrl: './tar-skeleton.html',
  styleUrl: './tar-skeleton.scss',
})
export class TarSkeleton {
  @Input() rowCount = 5;
  @Input() rowHeight = 56;

  rows(): number[] {
    return Array.from({ length: this.rowCount }, (_, i) => i);
  }
}
