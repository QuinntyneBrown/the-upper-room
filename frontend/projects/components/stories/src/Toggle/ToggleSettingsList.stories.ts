import { signal } from '@angular/core';
import type { StoryObj } from '@storybook/angular';

import type { TarToggle } from 'components';

export const SettingsList: StoryObj<TarToggle> = {
  render: () => {
    const reminders = signal(true);
    const digest = signal(false);
    return {
      props: { reminders, digest },
      template: `
      <div style="display: grid; gap: 12px; max-width: 420px">
        <tar-toggle [checked]="reminders()" (checkedChange)="reminders.set($event)">Email me before events I'm attending</tar-toggle>
        <tar-toggle [checked]="digest()" (checkedChange)="digest.set($event)">Weekly digest of new ideas</tar-toggle>
        <span style="color: var(--md-sys-color-on-surface-variant)">Reminders {{ reminders() ? 'on' : 'off' }} · Digest {{ digest() ? 'on' : 'off' }}</span>
      </div>
    `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          'Stateful settings bound to signals: `[checked]` reads each signal and `(checkedChange)` writes it back.',
      },
    },
  },
};
