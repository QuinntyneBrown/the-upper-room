// traces_to: L2-067
import { Component } from '@angular/core';
import { TarIcon } from '../../../../../components/src/lib/icon/icon';

@Component({
  selector: 'app-not-found',
  imports: [TarIcon],
  template: `
    <section data-testid="not-found" class="page">
      <tar-icon name="search-off" size="xl" />
      <h1 data-testid="not-found-heading">Page not found</h1>
      <p>The page you were looking for doesn't exist.</p>
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
    `,
  ],
})
export class NotFound {}
