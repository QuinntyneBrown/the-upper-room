import type { StoryObj } from '@storybook/angular';

import type { TarIconButton } from 'components';

export const RowActions: StoryObj<TarIconButton> = {
  render: () => ({
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center">
        <tar-icon-button icon="edit" ariaLabel="Edit contact Maya Chen" />
        <tar-icon-button icon="archive" ariaLabel="Archive contact Maya Chen" />
        <tar-icon-button icon="delete" ariaLabel="Delete contact Maya Chen" />
        <tar-icon-button icon="more_vert" ariaLabel="More actions for Maya Chen" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story: 'A typical contact-row action cluster. Each button names its target in `ariaLabel`.',
      },
    },
  },
};
