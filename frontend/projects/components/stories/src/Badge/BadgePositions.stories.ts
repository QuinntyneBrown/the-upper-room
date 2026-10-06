import type { StoryObj } from '@storybook/angular';

import type { TarBadge } from 'components';

export const Positions: StoryObj<TarBadge> = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 32px; padding: 16px">
        <tar-icon-button icon="mail" ariaLabel="Messages, 2 unread" tarBadge="2" tarBadgePosition="above after" />
        <tar-icon-button icon="mail" ariaLabel="Messages, 2 unread" tarBadge="2" tarBadgePosition="above before" />
        <tar-icon-button icon="mail" ariaLabel="Messages, 2 unread" tarBadge="2" tarBadgePosition="below after" />
        <tar-icon-button icon="mail" ariaLabel="Messages, 2 unread" tarBadge="2" tarBadgePosition="below before" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          '`tarBadgePosition` maps to `matBadgePosition`: `above after` (default), `above before`, `below after` and `below before`.',
      },
    },
  },
};
