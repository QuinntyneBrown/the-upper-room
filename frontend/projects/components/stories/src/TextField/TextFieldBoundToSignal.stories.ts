import { signal } from '@angular/core';
import type { StoryObj } from '@storybook/angular';

import type { TarTextField } from 'components';

export const BoundToSignal: StoryObj<TarTextField> = {
  render: () => {
    const phone = signal('555-01');
    const touched = signal(false);
    return {
      props: { phone, touched },
      template: `
      <div style="max-width: 420px; display: grid; gap: 16px">
        <tar-text-field label="Phone" type="tel" autocomplete="tel" inputmode="tel" [maxLength]="20" [value]="phone()" (valueChange)="phone.set($event)" (blurred)="touched.set(true)" [error]="touched() && phone().length < 7 ? 'Enter at least 7 digits' : null" />
        <p style="margin: 0; color: var(--md-sys-color-on-surface-variant)">Value: <code>{{ phone() }}</code></p>
      </div>
    `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          'The controlled pattern used by app pages: `[value]` reads a signal, `(valueChange)` writes it back, and the error appears after `blurred`.',
      },
    },
  },
};
