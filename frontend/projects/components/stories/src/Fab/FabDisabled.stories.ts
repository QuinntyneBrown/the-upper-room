import type { StoryObj } from '@storybook/angular';

import type { TarFab } from 'components';

export const Disabled: StoryObj<TarFab> = {
  render: () => ({
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center">
        <tar-fab icon="add" ariaLabel="New location" [disabled]="true" />
        <tar-fab icon="add" ariaLabel="New location" [extended]="true" [disabled]="true">New location</tar-fab>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          '`disabled` sets the native `disabled` attribute on the inner `<button>` in both forms.',
      },
    },
  },
};
