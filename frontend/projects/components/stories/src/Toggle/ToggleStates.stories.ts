import type { StoryObj } from '@storybook/angular';

import type { TarToggle } from 'components';

export const States: StoryObj<TarToggle> = {
  render: () => ({
    template: `
      <div style="display: grid; gap: 12px">
        <tar-toggle>Off</tar-toggle>
        <tar-toggle [checked]="true">On</tar-toggle>
        <tar-toggle [disabled]="true">Disabled</tar-toggle>
        <tar-toggle [checked]="true" [disabled]="true">On and disabled</tar-toggle>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: { story: 'Off, `checked`, and `disabled` (which disables the native switch).' },
    },
  },
};
