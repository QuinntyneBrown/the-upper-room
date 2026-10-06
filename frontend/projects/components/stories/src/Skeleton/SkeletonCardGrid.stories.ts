import type { StoryObj } from '@storybook/angular';

import type { TarSkeleton } from 'components';

export const CardGrid: StoryObj<TarSkeleton> = {
  render: () => ({
    template: `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px">
        <tar-skeleton [rowCount]="1" [rowHeight]="140" />
        <tar-skeleton [rowCount]="1" [rowHeight]="140" />
        <tar-skeleton [rowCount]="1" [rowHeight]="140" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'One tall row per cell approximates a grid of cards — for example the location cards for a city — while they load.',
      },
    },
  },
};
