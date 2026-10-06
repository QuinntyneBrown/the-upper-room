import type { StoryObj } from '@storybook/angular';

import type { TarIcon } from 'components';

export const RawLigature: StoryObj<TarIcon> = {
  render: () => ({
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center">
        <tar-icon name="handshake" />
        <tar-icon name="groups" />
        <tar-icon name="location_city" />
        <tar-icon name="volunteer_activism" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'A name that is not an alias is rendered as-is, so any Material Symbols ligature works. Prefer adding an alias once a glyph is used in more than one place.',
      },
    },
  },
};
