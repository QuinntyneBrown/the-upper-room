// traces_to: L2-115
import { Component, inject } from '@angular/core';
import { ThemeService, ThemeMode } from '../../theme/theme.service';

@Component({
  selector: 'app-appearance',
  template: `
    <h1>Appearance</h1>
    <div class="options">
      @for (m of modes; track m) {
        <button
          [attr.data-testid]="'theme-option-' + m"
          type="button"
          class="option"
          [class.option--active]="theme.mode() === m"
          (click)="theme.setMode(m)"
        >
          {{ m }}
        </button>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: grid;
        gap: var(--md-sys-space-4);
        padding: var(--md-sys-space-6);
      }
      h1 {
        margin: 0;
        font: var(--md-sys-typescale-headline-medium);
      }
      .options {
        display: flex;
        gap: var(--md-sys-space-2);
      }
      .option {
        border: 1px solid var(--md-sys-color-outline);
        border-radius: var(--md-sys-shape-corner-full);
        padding: var(--md-sys-space-2) var(--md-sys-space-6);
        background: transparent;
        color: inherit;
        text-transform: capitalize;
        cursor: pointer;
      }
      .option--active {
        background: var(--md-sys-color-primary);
        color: var(--md-sys-color-on-primary);
        border-color: transparent;
      }
    `,
  ],
})
export class Appearance {
  protected readonly theme = inject(ThemeService);
  protected readonly modes: ThemeMode[] = ['system', 'light', 'dark'];
}
