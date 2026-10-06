import type { StoryObj } from '@storybook/angular';

import type { TarTooltip } from 'components';

export const Shown: StoryObj<TarTooltip> = {
  render: () => ({
    template: `
      <div style="padding: 24px 48px 64px">
        <tar-icon-button
          icon="ios_share"
          ariaLabel="Export contacts"
          tarTooltip="Export contacts as CSV"
          tarTooltipPosition="below"
        />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const host = canvasElement.querySelector('tar-icon-button');
    host?.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
  },
  parameters: {
    docs: {
      description: {
        story:
          "The tooltip as it renders on hover: Material's `mat-tooltip` surface in an overlay, positioned below its host.",
      },
    },
  },
};
