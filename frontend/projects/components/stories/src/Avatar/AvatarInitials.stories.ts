import type { StoryObj } from '@storybook/angular';

import type { TarAvatar } from 'components';

export const Initials: StoryObj<TarAvatar> = {
  render: () => ({
    props: {
      twoNames: { displayName: 'Priya Nair', email: 'priya.nair@upperroom.org' },
      oneName: { displayName: 'Tobiah', email: 'tobiah@upperroom.org' },
      emailOnly: { email: 'events.toronto@upperroom.org' },
      unknown: {},
    },
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 16px; align-items: center">
        <tar-avatar [user]="twoNames" />
        <tar-avatar [user]="oneName" />
        <tar-avatar [user]="emailOnly" />
        <tar-avatar [user]="unknown" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Without `avatarUrl` the avatar shows initials: first letters of the first two words of `displayName`, else the first two letters of a single name or the email local part, else `??`. The background hue is derived from the email (or name), so a person keeps the same colour everywhere.',
      },
    },
  },
};
