// traces_to: L2-115
import { Component, inject } from '@angular/core';
import { THEME_SERVICE, ThemeMode } from 'domain';

@Component({
  selector: 'app-appearance',
  templateUrl: './appearance.html',
  styleUrl: './appearance.scss',
})
export class Appearance {
  protected readonly theme = inject(THEME_SERVICE);
  protected readonly modes: ThemeMode[] = ['system', 'light', 'dark'];
}
