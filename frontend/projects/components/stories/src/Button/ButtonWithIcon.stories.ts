import type { StoryObj } from '@storybook/angular';

import type { TarButton } from 'components';

export const WithIcon: StoryObj<TarButton> = {
  render: () => ({
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center">
        <tar-button icon="add">New contact</tar-button>
        <tar-button variant="tonal" icon="event">Add to calendar</tar-button>
        <tar-button variant="outlined" icon="download">Export CSV</tar-button>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          '`icon` takes a Material Symbols ligature and renders it before the label as `.tar-button__icon`.',
      },
    },
  },
};
