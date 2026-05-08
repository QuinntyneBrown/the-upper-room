import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';

export type TarSideNavMode = 'over' | 'push' | 'side';

@Component({
  selector: 'tar-side-nav',
  imports: [MatSidenavModule],
  templateUrl: './side-nav.html',
  styleUrl: './side-nav.scss',
})
export class TarSideNav {
  @Input() mode: TarSideNavMode = 'side';
  @Input() opened = true;
  @Input() position: 'start' | 'end' = 'start';
  @Input() fixedInViewport = false;
  @Input() testId: string | null = null;

  @Output() readonly openedChange = new EventEmitter<boolean>();
}
