// traces_to: L2-068
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TarIcon } from '../../../../../components/src/lib/icon/icon';

@Component({
  selector: 'app-forbidden',
  imports: [TarIcon, RouterLink],
  template: `
    <section data-testid="forbidden" class="page">
      <tar-icon name="block" size="xl" />
      <h1>You don't have permission</h1>
      <p>Ask your city lead if you think this is a mistake.</p>
      <a data-testid="forbidden-dashboard" routerLink="/dashboard-stub" class="btn">
        Go to dashboard
      </a>
    </section>
  `,
  styles: [
    `
      .page {
        display: grid;
        gap: var(--md-sys-space-3);
        justify-items: center;
        text-align: center;
        padding: var(--md-sys-space-12) var(--md-sys-space-4);
      }
      h1 {
        margin: 0;
        font: var(--md-sys-typescale-headline-medium);
      }
      p {
        margin: 0;
        color: var(--md-sys-color-on-surface-variant);
      }
      .btn {
        border: 0;
        border-radius: var(--md-sys-shape-corner-full);
        padding: var(--md-sys-space-2) var(--md-sys-space-6);
        background: var(--md-sys-color-primary);
        color: var(--md-sys-color-on-primary);
        font: var(--md-sys-typescale-label-large);
        text-decoration: none;
      }
    `,
  ],
})
export class Forbidden {}
