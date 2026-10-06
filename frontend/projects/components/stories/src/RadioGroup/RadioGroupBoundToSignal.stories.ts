import { signal } from '@angular/core';
import type { StoryObj } from '@storybook/angular';

import type { TarRadioGroup } from 'components';

export const BoundToSignal: StoryObj<TarRadioGroup> = {
  render: () => {
    const method = signal('phone');
    return {
      props: {
        method,
        options: [
          { value: 'email', label: 'Email' },
          { value: 'phone', label: 'Phone' },
          { value: 'text', label: 'Text message' },
        ],
      },
      template: `
      <div style="display: grid; gap: 8px">
        <tar-radio-group label="Preferred contact method" [options]="options" [value]="method()" (valueChange)="method.set($event)" />
        <span style="color: var(--md-sys-color-on-surface-variant)">Selected: <code>{{ method() }}</code></span>
      </div>
    `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          'Controlled usage: `[value]` reads a signal and `(valueChange)` writes the chosen option value back.',
      },
    },
  },
};
