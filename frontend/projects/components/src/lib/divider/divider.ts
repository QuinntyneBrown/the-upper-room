import { Component, Input } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'tar-divider',
  imports: [MatDividerModule],
  templateUrl: './divider.html',
  styleUrl: './divider.scss',
})
export class TarDivider {
  @Input() vertical = false;
  @Input() inset = false;
}
