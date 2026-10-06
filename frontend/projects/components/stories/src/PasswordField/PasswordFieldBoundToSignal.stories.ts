import { signal } from '@angular/core';
import type { StoryObj } from '@storybook/angular';

import type { TarPasswordField } from 'components';

export const BoundToSignal: StoryObj<TarPasswordField> = {
  render: () => {
    const password = signal('');
    return {
      props: { password },
      template: `
      <div style="max-width: 360px; display: grid; gap: 8px">
        <tar-password-field label="New password" autocomplete="new-password" [value]="password()" (valueChange)="password.set($event)" [error]="password().length > 0 && password().length < 12 ? 'Use at least 12 characters.' : null" />
        <span style="color: var(--md-sys-color-on-surface-variant)">{{ password().length }} characters</span>
      </div>
    `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          'Controlled usage: `[value]` reads a signal and `(valueChange)` writes it back on every keystroke.',
      },
    },
  },
};
