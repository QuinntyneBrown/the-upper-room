// traces_to: L2-017
import { Component } from '@angular/core';

@Component({
  selector: 'app-verify-email',
  template: `
    <section class="page">
      <h1>Verify your email</h1>
      <p>We sent you a link to confirm your address.</p>
    </section>
  `,
  styles: [
    `
      .page {
        min-height: 100dvh;
        display: grid;
        place-items: center;
        text-align: center;
        padding: var(--md-sys-space-6);
        gap: var(--md-sys-space-3);
      }
      h1 {
        margin: 0;
        font: var(--md-sys-typescale-headline-small);
      }
      p {
        margin: 0;
        color: var(--md-sys-color-on-surface-variant);
      }
    `,
  ],
})
export class VerifyEmail {}
