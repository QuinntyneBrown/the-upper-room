import type { StoryObj } from '@storybook/angular';

import type { TarBadge } from 'components';

export const OnButton: StoryObj<TarBadge> = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 24px; padding: 16px">
        <tar-button variant="tonal" icon="group" tarBadge="4" [tarBadgeOverlap]="false">Pending invites</tar-button>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'On a text button, set `[tarBadgeOverlap]="false"` so the badge sits beside the label instead of covering it.',
      },
    },
  },
};
