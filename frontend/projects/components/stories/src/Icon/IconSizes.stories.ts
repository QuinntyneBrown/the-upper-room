import type { StoryObj } from '@storybook/angular';

import type { TarIcon } from 'components';

export const Sizes: StoryObj<TarIcon> = {
  render: () => ({
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center">
        <tar-icon name="events" size="xs" />
        <tar-icon name="events" size="sm" />
        <tar-icon name="events" size="md" />
        <tar-icon name="events" size="lg" />
        <tar-icon name="events" size="xl" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'The five sizes map to the `--icon-size-*` tokens through `.tar-icon--xs` … `.tar-icon--xl`. `md` is the default.',
      },
    },
  },
};
