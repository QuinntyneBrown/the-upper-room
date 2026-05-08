// traces_to: L2-074
import { Component } from '@angular/core';

@Component({
  selector: 'app-landing',
  template: `<h1>The Upper Room</h1>`,
  styles: [
    `
      h1 {
        margin: 0;
        padding: var(--md-sys-space-6);
        font: var(--md-sys-typescale-headline-large);
      }
    `,
  ],
})
export class Landing {}
