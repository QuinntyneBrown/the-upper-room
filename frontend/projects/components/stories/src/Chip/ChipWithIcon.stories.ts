import type { StoryObj } from '@storybook/angular';

import type { TarChip } from 'components';

export const WithIcon: StoryObj<TarChip> = {
  render: () => ({
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 8px">
        <tar-chip label="Toronto" icon="location_on" />
        <tar-chip label="Partner" icon="domain" />
        <tar-chip label="Saturday, 14 Nov" icon="event" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          '`icon` takes a Material Symbols ligature and renders it as a leading `mat-icon` (`matChipAvatar`, class `.tar-chip__icon`).',
      },
    },
  },
};
