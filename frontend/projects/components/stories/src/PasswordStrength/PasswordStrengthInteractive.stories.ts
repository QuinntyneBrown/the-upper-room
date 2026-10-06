import { signal } from '@angular/core';
import type { StoryObj } from '@storybook/angular';

import type { TarPasswordStrength } from 'components';

export const Interactive: StoryObj<TarPasswordStrength> = {
  render: () => {
    const password = signal('');
    return {
      props: {
        password,
        update: (event: Event) => password.set((event.target as HTMLInputElement).value),
      },
      template: `
        <div style="max-width: 360px; display: grid; gap: 8px">
          <label for="sb-new-password" style="font: var(--md-sys-typescale-label-large)">New password</label>
          <input
            id="sb-new-password"
            type="password"
            autocomplete="new-password"
            aria-describedby="sb-new-password-strength"
            [value]="password()"
            (input)="update($event)"
            style="padding: 8px 12px; font: var(--md-sys-typescale-body-large)"
          />
          <tar-password-strength
            id="sb-new-password-strength"
            [password]="password()"
            userEmail="priya.nair@upperroom.org"
          />
        </div>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          'Bound to a password input as on the reset-password screen: the meter re-evaluates on every keystroke.',
      },
    },
  },
};
