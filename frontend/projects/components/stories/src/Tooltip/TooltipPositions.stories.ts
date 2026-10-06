import type { StoryObj } from '@storybook/angular';

import type { TarTooltip } from 'components';

export const Positions: StoryObj<TarTooltip> = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 24px; padding: 48px">
        <tar-icon-button icon="edit" ariaLabel="Edit contact" tarTooltip="Edit contact" tarTooltipPosition="above" />
        <tar-icon-button icon="share" ariaLabel="Share event" tarTooltip="Share event" tarTooltipPosition="below" />
        <tar-icon-button icon="map" ariaLabel="Show on map" tarTooltip="Show on map" tarTooltipPosition="before" />
        <tar-icon-button icon="delete" ariaLabel="Delete idea" tarTooltip="Delete idea" tarTooltipPosition="after" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Hover or keyboard-focus each button. `tarTooltipPosition` maps to `matTooltipPosition` (`above`, `below`, `left`, `right`, `before`, `after`); `before`/`after` follow the text direction. Material flips the tooltip if it would leave the viewport.',
      },
    },
  },
};
