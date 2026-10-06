import type { StoryObj } from '@storybook/angular';

import type { TarToolbar } from 'components';

export const WithActions: StoryObj<TarToolbar> = {
  render: () => ({
    template: `
      <tar-toolbar title="The Upper Room">
        <tar-icon-button icon="notifications" ariaLabel="Notifications" />
        <tar-icon-button icon="account_circle" ariaLabel="Account" />
        <tar-button variant="tonal" icon="add">New idea</tar-button>
      </tar-toolbar>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Projected content lands in `.tar-toolbar__actions`, pushed to the trailing edge by `.tar-toolbar__spacer`.',
      },
    },
  },
};
