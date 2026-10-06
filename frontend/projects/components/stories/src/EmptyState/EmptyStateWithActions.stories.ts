import type { StoryObj } from '@storybook/angular';

import type { TarEmptyState } from 'components';

export const WithActions: StoryObj<TarEmptyState> = {
  render: () => ({
    template: `
      <tar-empty-state
        heading="No partners yet"
        body="Add the organisations you work with in Ottawa, or import them from a spreadsheet."
        icon="partners"
      >
        <tar-button icon="add">Add partner</tar-button>
        <tar-button variant="outlined" icon="upload">Import CSV</tar-button>
      </tar-empty-state>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Projected content renders in `.tar-empty-state__actions`, a row of buttons below the body. Lead with the action that fills the list.',
      },
    },
  },
};
