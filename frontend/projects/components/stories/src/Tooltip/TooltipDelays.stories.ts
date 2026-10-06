import type { StoryObj } from '@storybook/angular';

import type { TarTooltip } from 'components';

export const Delays: StoryObj<TarTooltip> = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 24px; padding: 48px">
        <tar-button variant="outlined" tarTooltip="Shows immediately">No delay</tar-button>
        <tar-button
          variant="outlined"
          tarTooltip="Shows after 600 ms, hides after 1 s"
          [tarTooltipShowDelay]="600"
          [tarTooltipHideDelay]="1000"
        >
          Delayed
        </tar-button>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          '`tarTooltipShowDelay` and `tarTooltipHideDelay` (milliseconds) map to the `MatTooltip` delays. A short show delay keeps tooltips from flashing as the pointer crosses a toolbar.',
      },
    },
  },
};
