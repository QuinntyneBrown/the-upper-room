import { Component, Input } from '@angular/core';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'tar-list',
  imports: [MatListModule],
  templateUrl: './list.html',
  styleUrl: './list.scss',
})
export class TarList {
  @Input() ariaLabel: string | null = null;
  @Input() role: string | null = 'list';
}
