import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'tar-nav-item',
  imports: [RouterLink, MatListModule, MatIconModule],
  templateUrl: './nav-item.html',
  styleUrl: './nav-item.scss',
})
export class TarNavItem {
  @Input({ required: true }) label!: string;
  @Input() icon: string | null = null;
  @Input() routerLink: string | readonly string[] | null = null;
  @Input() active = false;
  @Input() badge: string | number | null = null;
  @Input() testId: string | null = null;

  @Output() readonly clicked = new EventEmitter<MouseEvent>();
}
