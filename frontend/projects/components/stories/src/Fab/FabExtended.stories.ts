import type { StoryObj } from '@storybook/angular';

import type { TarFab } from 'components';

export const Extended: StoryObj<TarFab> = {
  render: () => ({
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center">
        <tar-fab icon="add" ariaLabel="New event" [extended]="true">New event</tar-fab>
        <tar-fab icon="add" ariaLabel="New board" [extended]="true">New board</tar-fab>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          '`extended` adds `.tar-fab--extended` and shows the projected label beside the icon.',
      },
    },
  },
};
