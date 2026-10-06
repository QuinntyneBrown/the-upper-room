import type { StoryObj } from '@storybook/angular';

import type { TarBadge } from 'components';

export const Sizes: StoryObj<TarBadge> = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 32px; padding: 16px">
        <tar-icon-button icon="lightbulb" ariaLabel="New ideas" tarBadge="1" tarBadgeSize="small" />
        <tar-icon-button icon="lightbulb" ariaLabel="5 new ideas" tarBadge="5" tarBadgeSize="medium" />
        <tar-icon-button icon="lightbulb" ariaLabel="12 new ideas" tarBadge="12" tarBadgeSize="large" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          '`tarBadgeSize` maps to `matBadgeSize`. In Material 3 a `small` badge renders as a dot and hides its text — use it for "something new" without a count. Empty content hides the badge entirely, so pass a non-empty value.',
      },
    },
  },
};
